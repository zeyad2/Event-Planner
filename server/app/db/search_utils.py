from sqlalchemy import func, or_
from sqlalchemy.orm import Query
from app.models import Event


def search_events_fulltext(query: Query, keyword: str) -> Query:        
    #Example: filtered_query = search_events_fulltext(query, "birthday party")
    
    if not keyword or not keyword.strip():
        return query
    
    search_vector = func.to_tsvector(
        'english',
        func.coalesce(Event.title, '') + ' ' + func.coalesce(Event.description, '')
    )
    search_query = func.to_tsquery('english', keyword.strip())
    
    return query.filter(search_vector.op('@@')(search_query))


def prepare_tsquery(keyword: str) -> str:
    
    if not keyword:
        return ""
    
    words = keyword.strip().split()
    escaped_words = [word.replace("'", "''") for word in words]
    return " & ".join(escaped_words)
