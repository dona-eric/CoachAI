# backend/routers/exercises.py
from fastapi import APIRouter, HTTPException
from Backend.models.schemas import ExerciseSearchRequest, ExerciseSearchResponse, ExerciseResult
from RAG.retriever import retrieve

router = APIRouter(prefix="/exercises", tags=["Exercises"])

@router.post("/search", response_model=ExerciseSearchResponse)
async def search_exercises(request: ExerciseSearchRequest):
    """Recherche des exercices dans la base RAG."""
    try:
        query = (
            request.query or
            f"exercises for {request.muscle}" if request.muscle
            else f"exercises with {request.equipment}"
        )
        docs    = retrieve(query, k=request.k)
        results = []

        for doc in docs:
            results.append(ExerciseResult(
                name=        doc.metadata.get("name", ""),
                muscles=     doc.metadata.get("target_muscles") or doc.metadata.get("target", ""),
                body_part=   doc.metadata.get("body_parts")     or doc.metadata.get("body_part", ""),
                equipment=   doc.metadata.get("equipments")     or doc.metadata.get("equipment", ""),
                instructions=doc.metadata.get("instructions", ""),
                gif_small=   doc.metadata.get("gif_180", ""),
                gif_medium=  doc.metadata.get("gif_360", ""),
                gif_large=   doc.metadata.get("gif_720", ""),
                source=      doc.metadata.get("source", ""),
            ))

        return ExerciseSearchResponse(
            query=query,
            total=len(results),
            results=results,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))