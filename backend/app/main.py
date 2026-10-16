from fastapi import FastAPI

app = FastAPI(title="Energy App API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def health():
    return {"status": "OK"}