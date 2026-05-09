# app/core/database.py

from typing import Annotated
from fastapi.params import Depends
from sqlmodel import Session, create_engine
from collections.abc import Generator

from .settings import settings

engine = create_engine(str(settings.database_uri))
"""
engine (Engine): Motor de base de datos creado a partir de la URI especificada en :mod:`settings`.
Usa SQLAlchemy/SQLModel para manejar conexiones y sesiones.
"""


def get_db() -> Generator[Session, None, None]:
    """
    Generador que provee una sesión de base de datos SQLModel.

    :yields: Una sesión activa de SQLModel para ejecutar queries.
    :rtype: Generator[Session, None, None]
    """
    # Se crea una nueva sesión de base de datos
    # with: Se asegura de cerrarla automáticamente cuando se sale del bloque, incluso si hay errores.
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
"""Alias tipado para inyección de dependencias de base de datos en FastAPI."""
