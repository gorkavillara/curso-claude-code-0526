#!/usr/bin/env python3
"""
Google Forms Skill - Create quizzes and surveys from course exercises.

Usage:
    python forms_skill.py create --json '{"title":"...","questions":[...]}'
    python forms_skill.py create --file questions.json
    python forms_skill.py list [--limit N] [--account EMAIL]
    python forms_skill.py get FORM_ID [--account EMAIL]
    python forms_skill.py delete FORM_ID [--account EMAIL]
    python forms_skill.py login [--account EMAIL]
    python forms_skill.py logout [--account EMAIL]
    python forms_skill.py accounts

Setup:
    1. Enable Google Forms API in Google Cloud Console.
    2. Place credentials.json in this folder (or reuse from gmail-skill).
    3. pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

SKILL_DIR = Path(__file__).parent.parent
TOKENS_DIR = SKILL_DIR / "tokens"
CREDENTIALS_FILE = SKILL_DIR / "credentials.json"

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
]

TOKENS_DIR.mkdir(parents=True, exist_ok=True)

QUESTION_TYPE_MAP = {
    "radio": "RADIO",
    "checkbox": "CHECKBOX",
    "text": "SHORT_ANSWER",
    "paragraph": "PARAGRAPH",
    "scale": "LINEAR_SCALE",
}


def get_credentials_file() -> Path:
    if CREDENTIALS_FILE.exists():
        return CREDENTIALS_FILE
    for alt in ["gmail-skill", "google-sheets-skill", "google-slides-skill"]:
        p = Path.home() / f".claude/skills/{alt}/credentials.json"
        if p.exists():
            return p
    # Also check project-level skills
    project_skills = Path(__file__).parent.parent.parent
    for alt in ["gmail-skill", "google-slides-skill"]:
        p = project_skills / alt / "credentials.json"
        if p.exists():
            return p
    print("No credentials.json found. Enable Google Forms API and add credentials.json here.")
    print(f"Expected path: {CREDENTIALS_FILE}")
    sys.exit(1)


def get_token_path(account: str = None) -> Path:
    if account:
        safe = "".join(c if c.isalnum() or c in ".-_" else "_" for c in account)
        return TOKENS_DIR / f"token_{safe}.json"
    tokens = list(TOKENS_DIR.glob("token_*.json"))
    return tokens[0] if tokens else TOKENS_DIR / "token_default.json"


def get_credentials(account: str = None):
    creds_file = get_credentials_file()
    token_path = get_token_path(account)
    creds = None

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                creds = None
        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_file), SCOPES)
            creds = flow.run_local_server(port=9995)
        with open(token_path, "w") as f:
            f.write(creds.to_json())

    return creds


def get_forms_service(account: str = None):
    return build("forms", "v1", credentials=get_credentials(account))


def get_drive_service(account: str = None):
    return build("drive", "v3", credentials=get_credentials(account))


def build_question_request(question: dict, index: int) -> dict:
    q_type = question.get("type", "radio").lower()
    forms_type = QUESTION_TYPE_MAP.get(q_type, "RADIO")
    title = question.get("title", f"Pregunta {index + 1}")
    options = question.get("options", [])

    if forms_type in ("SHORT_ANSWER", "PARAGRAPH"):
        return {
            "createItem": {
                "item": {
                    "title": title,
                    "questionItem": {
                        "question": {
                            "required": False,
                            "textQuestion": {
                                "paragraph": forms_type == "PARAGRAPH"
                            }
                        }
                    }
                },
                "location": {"index": index}
            }
        }

    if forms_type == "LINEAR_SCALE":
        low = question.get("low", 1)
        high = question.get("high", 5)
        return {
            "createItem": {
                "item": {
                    "title": title,
                    "questionItem": {
                        "question": {
                            "required": False,
                            "scaleQuestion": {
                                "low": low,
                                "high": high,
                                "lowLabel": question.get("lowLabel", ""),
                                "highLabel": question.get("highLabel", ""),
                            }
                        }
                    }
                },
                "location": {"index": index}
            }
        }

    # RADIO or CHECKBOX
    return {
        "createItem": {
            "item": {
                "title": title,
                "questionItem": {
                    "question": {
                        "required": False,
                        "choiceQuestion": {
                            "type": forms_type,
                            "options": [{"value": str(opt)} for opt in options],
                            "shuffle": False,
                        }
                    }
                }
            },
            "location": {"index": index}
        }
    }


def cmd_create(args):
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
    elif args.json:
        data = json.loads(args.json)
    else:
        print("Error: provide --json or --file")
        sys.exit(1)

    title = data.get("title", "Quiz del curso")
    description = data.get("description", "")
    questions = data.get("questions", [])

    if not questions:
        print(json.dumps({"error": "No questions provided"}, indent=2))
        sys.exit(1)

    service = get_forms_service(args.account)

    form_body = {
        "info": {
            "title": title,
            "documentTitle": title,
        }
    }
    if description:
        form_body["info"]["description"] = description

    form = service.forms().create(body=form_body).execute()
    form_id = form["formId"]

    requests = [build_question_request(q, i) for i, q in enumerate(questions)]

    service.forms().batchUpdate(
        formId=form_id,
        body={"requests": requests}
    ).execute()

    view_url = f"https://docs.google.com/forms/d/{form_id}/viewform"
    edit_url = f"https://docs.google.com/forms/d/{form_id}/edit"
    short_url = f"https://forms.gle/{form_id}"

    print(json.dumps({
        "success": True,
        "formId": form_id,
        "title": title,
        "questionCount": len(questions),
        "viewUrl": view_url,
        "editUrl": edit_url,
        "shortUrl": short_url,
    }, indent=2, ensure_ascii=False))


def cmd_list(args):
    drive = get_drive_service(args.account)
    results = drive.files().list(
        q="mimeType='application/vnd.google-apps.form'",
        pageSize=args.limit,
        orderBy="modifiedTime desc",
        fields="files(id, name, modifiedTime, webViewLink)"
    ).execute()

    forms = []
    for f in results.get("files", []):
        forms.append({
            "formId": f["id"],
            "title": f["name"],
            "modifiedTime": f.get("modifiedTime"),
            "viewUrl": f"https://docs.google.com/forms/d/{f['id']}/viewform",
            "editUrl": f"https://docs.google.com/forms/d/{f['id']}/edit",
        })

    print(json.dumps({"forms": forms, "total": len(forms)}, indent=2, ensure_ascii=False))


def cmd_get(args):
    service = get_forms_service(args.account)
    form = service.forms().get(formId=args.form_id).execute()

    items = []
    for item in form.get("items", []):
        q_item = item.get("questionItem", {})
        question = q_item.get("question", {})
        choice_q = question.get("choiceQuestion", {})
        items.append({
            "title": item.get("title", ""),
            "type": choice_q.get("type", question.get("textQuestion") and "TEXT" or "UNKNOWN"),
            "options": [o.get("value") for o in choice_q.get("options", [])],
        })

    print(json.dumps({
        "formId": form.get("formId"),
        "title": form.get("info", {}).get("title"),
        "description": form.get("info", {}).get("description", ""),
        "questionCount": len(items),
        "questions": items,
        "viewUrl": f"https://docs.google.com/forms/d/{form.get('formId')}/viewform",
        "editUrl": f"https://docs.google.com/forms/d/{form.get('formId')}/edit",
    }, indent=2, ensure_ascii=False))


def cmd_delete(args):
    drive = get_drive_service(args.account)
    drive.files().delete(fileId=args.form_id).execute()
    print(json.dumps({"success": True, "formId": args.form_id, "deleted": True}, indent=2))


def cmd_accounts(args):
    accounts = [{"name": f.stem.replace("token_", "")} for f in TOKENS_DIR.glob("token_*.json")]
    print(json.dumps({"accounts": accounts}, indent=2))


def cmd_login(args):
    get_credentials(args.account)
    print(json.dumps({"success": True}, indent=2))


def cmd_logout(args):
    path = get_token_path(args.account)
    if path.exists():
        path.unlink()
    print(json.dumps({"success": True}, indent=2))


def add_account_arg(p):
    p.add_argument("--account", "-a", help="Google account email")


def main():
    parser = argparse.ArgumentParser(description="Google Forms Skill — Course quiz generator")
    subs = parser.add_subparsers(dest="command")

    # accounts
    subs.add_parser("accounts").set_defaults(func=cmd_accounts)

    # login
    login = subs.add_parser("login")
    login.add_argument("--account", "-a")
    login.set_defaults(func=cmd_login)

    # logout
    logout = subs.add_parser("logout")
    logout.add_argument("--account", "-a")
    logout.set_defaults(func=cmd_logout)

    # create
    create = subs.add_parser("create", help="Create a new form from JSON")
    create.add_argument("--json", "-j", help="JSON string with title and questions")
    create.add_argument("--file", "-f", help="Path to JSON file with questions")
    add_account_arg(create)
    create.set_defaults(func=cmd_create)

    # list
    ls = subs.add_parser("list", help="List existing forms")
    ls.add_argument("--limit", "-l", type=int, default=10)
    add_account_arg(ls)
    ls.set_defaults(func=cmd_list)

    # get
    get = subs.add_parser("get", help="Get form details")
    get.add_argument("form_id")
    add_account_arg(get)
    get.set_defaults(func=cmd_get)

    # delete
    delete = subs.add_parser("delete", help="Delete a form")
    delete.add_argument("form_id")
    add_account_arg(delete)
    delete.set_defaults(func=cmd_delete)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
