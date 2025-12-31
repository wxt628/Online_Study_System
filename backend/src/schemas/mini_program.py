from pydantic import BaseModel
from datetime import datetime

class MiniProgramOut(BaseModel):
	program_id: int
	name: str
	icon_url: str
	description: str
	url: str
	category: str
	is_active: bool
	display_order: int
	created_at: datetime

class MiniProgramList(BaseModel):
	mini_programs_list: list[MiniProgramOut]
	page: int
	page_size: int
	page_count: int
