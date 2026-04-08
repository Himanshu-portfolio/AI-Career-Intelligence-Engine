from sqlalchemy.ext.asyncio import AsyncSession
from app.core.models import MockSession
from app.shared.llm.client import llm_generate_json
from app.shared.prompts.templates import (
    MOCK_QUESTION_SYSTEM, MOCK_DSA_QUESTION,
    ANSWER_EVALUATION_SYSTEM, ANSWER_EVALUATION,
)


async def generate_question(
    db: AsyncSession, user_id: str, session_type: str = "dsa",
    company: str = "Generic", difficulty: str = "medium", topic: str = "arrays"
) -> dict:
    prompt = MOCK_DSA_QUESTION.format(company_name=company, difficulty=difficulty, topic=topic)
    question = await llm_generate_json(prompt, MOCK_QUESTION_SYSTEM)

    session = MockSession(
        user_id=user_id, company=company,
        session_type=session_type, question_data=question,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": str(session.id), "question": question}


async def evaluate_answer(db: AsyncSession, session_id: str, answer_text: str, code: str = "") -> dict:
    session = await db.get(MockSession, session_id)
    if not session:
        raise ValueError("Session not found")

    prompt = ANSWER_EVALUATION.format(
        question_text=str(session.question_data)[:2000],
        answer_text=answer_text[:3000],
        code=code[:2000],
    )
    evaluation = await llm_generate_json(prompt, ANSWER_EVALUATION_SYSTEM)

    session.answer_text = answer_text
    session.code = code
    session.evaluation = evaluation
    session.score = evaluation.get("overall_score", 0)
    await db.commit()
    return evaluation
