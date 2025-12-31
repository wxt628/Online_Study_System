from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src import database
from src.schemas.mini_program import MiniProgramOut
from src.security import get_current_user
from src.dependencies import get_db

router = APIRouter()

@router.get("/mini-programs", response_model=list[MiniProgramOut])
def get_mini_programs(
	category: str | None = None,
	_: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	query = db.query(database.MiniProgram)
	if category:
		query = query.filter(database.MiniProgram.category == category)
	items = query.all()
	
	return [MiniProgramOut(
		program_id=x.program_id,
		name=x.name,
		icon_url=x.icon_url,
		description=x.description,
		url=x.url,
		category=x.category,
		is_active=x.is_active,
		display_order=x.display_order,
		created_at=x.created_at
	) for x in items ]
