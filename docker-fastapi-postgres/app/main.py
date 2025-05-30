from fastapi import FastAPI, Depends, Request, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import List
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Модель для строки таблицы
class TableRow(BaseModel):
    location: str
    defect_description: str
    defect_category: str
    elimination_method: str
    photo: str = None
    tag_link: str = None

# Модель для всего набора данных
class TableData(BaseModel):
    rows: List[TableRow]

# Подключение к БД
def get_db_connection():
    conn = psycopg2.connect(
        host="127.0.0.1",
        port="5432",
        database="database",
        user="postgres",
        password="postgres"
    )
    return conn

@app.get("/", response_class=HTMLResponse)
def root():
    return FileResponse("app/templates/index.html")

@app.post("/save-table-data/")
async def save_table_data(rows: List[TableRow]):  # Теперь ждём массив, а не объект
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for row in rows:
            cursor.execute(
                """
                INSERT INTO defects (
                    location, 
                    defect_description, 
                    defect_category, 
                    elimination_method, 
                    photo, 
                    tag_link
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    row.location,
                    row.defect_description,
                    row.defect_category,
                    row.elimination_method,
                    row.photo,
                    row.tag_link
                )
            )
        conn.commit()
        return {"message": "Данные сохранены"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if conn:
            conn.close()

@app.get("/defects/", response_model=List[TableRow])
def get_all_defects():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT *
            FROM defects
            ORDER BY id
        """)
        
        defects = cursor.fetchall()
        return defects
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if conn:
            conn.close()