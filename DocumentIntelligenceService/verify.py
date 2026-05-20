import asyncio
import json
import uuid
import httpx

# Configurations
GATEWAY_URL = "http://localhost:5000"
DOCINTEL_URL = "http://localhost:5003"
PM_URL = "http://localhost:5002"

# Test IDs
USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
PROJECT_ID = uuid.UUID("55555555-5555-5555-5555-555555555555")

async def test_all():
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("\n=== 1. SYNCING DATA VIA WEBHOOKS ===")
        
        # Sync Project
        print("Syncing Project...")
        sync_proj_payload = {
            "id": str(PROJECT_ID),
            "name": "E-Commerce System Test RAG",
            "description": "Project for RAG and AI Agent testing",
            "status": "active"
        }
        res = await client.post(f"{DOCINTEL_URL}/api/v1/webhooks/projects", json=sync_proj_payload)
        print("Webhook Project Response Status:", res.status_code)
        print("Webhook Project Response Body:", res.json())
        
        # Sync members
        print("Syncing Project Members...")
        sync_mem_payload = {
            "member_user_ids": [str(USER_ID)]
        }
        res = await client.post(f"{DOCINTEL_URL}/api/v1/webhooks/projects/{PROJECT_ID}/members", json=sync_mem_payload)
        print("Webhook Members Response Status:", res.status_code)
        print("Webhook Members Response Body:", res.json())
        
        print("\n=== 2. UPLOADING DOCUMENT ===")
        doc_content = """# Beaverdash Project Plan
Beaverdash is a microservices-based project management system.
The system uses the following technologies:
1. Backend: .NET Core 10, C#
2. Frontend: Next.js, React
3. Database: PostgreSQL and pgvector
4. AI Service: FastAPI, Python, Ollama BGE-M3

Implementation Roadmap:
- Week 1: Database and infrastructure design
- Week 2: Build Core API and Gateway
- Week 3: Integrate RAG AI Service and Agent
- Week 4: End-to-End testing and Deployment

The project completion deadline is 2026-12-31.
Project manager is User 11111111-1111-1111-1111-111111111111.
ToDo Kanban Board Column ID: 88888888-8888-8888-8888-888888888888.
"""
        files = {
            "file": ("project_plan.md", doc_content.encode("utf-8"), "text/markdown")
        }
        data = {
            "project_id": str(PROJECT_ID)
        }
        headers = {
            "X-User-Id": str(USER_ID)
        }
        
        print("Uploading document...")
        try:
            res = await client.post(f"{DOCINTEL_URL}/api/v1/documents", data=data, files=files, headers=headers)
            print("Upload Response Status:", res.status_code)
            print("Upload Response Body:", res.json())
        except Exception as e:
            print("Upload failed:", str(e))
            return
        
        print("\n=== 3. LISTING PROJECT DOCUMENTS ===")
        res = await client.get(f"{DOCINTEL_URL}/api/v1/documents?project_id={PROJECT_ID}", headers=headers)
        print("List Response Status:", res.status_code)
        print("List Response Body:", res.json())
        
        print("\n=== 4. CREATING AI CHAT SESSION ===")
        chat_session_payload = {
            "project_id": str(PROJECT_ID),
            "title": "Project QA Session"
        }
        res = await client.post(f"{DOCINTEL_URL}/api/v1/chat/sessions", json=chat_session_payload, headers=headers)
        print("Chat Session Response Status:", res.status_code)
        print("Chat Session Response Body:", res.json())
        session_id = res.json()["id"]
        
        print("\n=== 5. CHATTING WITH AI (RAG TEST) ===")
        chat_payload = {
            "content": "What technologies does Beaverdash use and what is the roadmap?"
        }
        print("Sending message...")
        res = await client.post(f"{DOCINTEL_URL}/api/v1/chat/sessions/{session_id}/messages", json=chat_payload, headers=headers)
        print("AI Response Status:", res.status_code)
        response_json = res.json()
        print("AI Response Content:", response_json["content"])
        print("Used Documents:")
        for doc in response_json.get("used_documents", []):
            print(f"- File: {doc['file_name']} (similarity score: {doc['similarity_score']})")
            
        print("\n=== 6. CHATTING WITH AI (AGENT TOOL CALLING TEST) ===")
        agent_payload = {
            "content": "Please create a task with title 'Integrate VNPay' and description 'Implement VNPay payment workflow' in the Kanban column '88888888-8888-8888-8888-888888888888' with 'High' priority and due date '2026-05-30T17:00:00Z'."
        }
        print("Sending agent message...")
        res = await client.post(f"{DOCINTEL_URL}/api/v1/chat/sessions/{session_id}/messages", json=agent_payload, headers=headers)
        print("Agent Response Status:", res.status_code)
        response_json = res.json()
        print("Agent Response Content:", response_json["content"])
        print("Tool Calls:", json.dumps(response_json.get("tool_calls"), indent=2, ensure_ascii=False))
        print("Tool Results:", json.dumps(response_json.get("tool_results"), indent=2, ensure_ascii=False))

        print("\n=== 6.2 CONFIRMING AND EXECUTING THE TOOL ===")
        confirm_payload = {
            "content": "Yes, please proceed to create the task."
        }
        print("Sending confirmation...")
        res = await client.post(f"{DOCINTEL_URL}/api/v1/chat/sessions/{session_id}/messages", json=confirm_payload, headers=headers)
        print("Agent Response Status:", res.status_code)
        response_json = res.json()
        print("Agent Response Content:", response_json["content"])
        print("Tool Calls:", json.dumps(response_json.get("tool_calls"), indent=2, ensure_ascii=False))
        print("Tool Results:", json.dumps(response_json.get("tool_results"), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    from app.core.database import SessionLocal
    from app.models.user import User
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == USER_ID).first()
        if not user:
            user = User(
                id=USER_ID,
                email="admin@beaverdash.com",
                display_name="Administrator",
                avatar=None
            )
            db.add(user)
            db.commit()
            print("Successfully initialized test User in DB.")
        else:
            print("Test User already exists in DB.")
    finally:
        db.close()
        
    asyncio.run(test_all())
