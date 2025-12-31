from pydantic import BaseModel
from datetime import datetime

class CourseOut(BaseModel):
	course_id: int
	course_code: str
	name: str
	teacher: str
	semester: str

class AssignmentOut(BaseModel):
	assignment_id: int
	course_id: int
	title: str
	description: str | None
	attachment_url: str | None
	deadline: str | None
	created_at: str | None

class SubmissionOut(BaseModel):
	submission_id: int
	assignment_id: int
	user_id: int
	file_url: str
	submitted_at: datetime
	score: float | None
	feedback: str | None
	comment: str | None
