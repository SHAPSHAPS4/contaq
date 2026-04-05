"""
Contraq CV Service — PDF Pre-processing & Symbol Detection
FastAPI service running alongside Node.js on Railway.

Endpoints:
  POST /preprocess   — Extract text, vectors, geometry from PDF
  POST /detect       — Run CV symbol detection (Roboflow stub)
  POST /full         — Pre-process + detect in one call
  GET  /health       — Health check
"""

import io
import re
import json
import base64
from typing import Dict, Any, List, Optional
from collections import defaultdict

import fitz  # PyMuPDF
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Contraq CV Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════
# PDF PRE-PROCESSOR (Enhanced with PyMuPDF)
# ═══════════════════════════════════════════════

def preprocess_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """Extract text, vectors, annotations, and geometry from a PDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    result = {
        "page_count": len(doc),
        "text_layer_exists": False,
        "is_scanned": True,
        "scale_references": [],
        "dimension_hints": [],
        "equipment_tags": [],
        "size_annotations": [],
        "drawing_numbers": [],
        "revisions": [],
        "pages": [],
        "vector_summary": {
            "total_lines": 0,
            "total_curves": 0,
            "total_rects": 0,
            "line_colors": {},
            "line_widths": {},
        },
    }

    all_text = ""

    for page_num, page in enumerate(doc):
        page_data = {
            "page_num": page_num + 1,
            "width": page.rect.width,
            "height": page.rect.height,
            "text": "",
            "annotations": [],
            "vector_geometry": [],
        }

        # ── Text extraction ──
        text = page.get_text("text")
        if text.strip():
            result["text_layer_exists"] = True
            result["is_scanned"] = False
        page_data["text"] = text[:3000]  # truncate per page
        all_text += text + "\n"

        # ── Vector geometry extraction (lines, curves, rects) ──
        try:
            drawings = page.get_drawings()
            lines = 0
            curves = 0
            rects = 0

            for item in drawings:
                item_type = item.get("type", "")
                color = item.get("color")
                width = item.get("width", 0)

                if item_type == "l":
                    lines += 1
                elif item_type == "c":
                    curves += 1
                elif item_type == "re":
                    rects += 1

                # Track colors and widths for line type analysis
                if color:
                    color_key = str(tuple(round(c, 2) for c in color)) if isinstance(color, (list, tuple)) else str(color)
                    result["vector_summary"]["line_colors"][color_key] = result["vector_summary"]["line_colors"].get(color_key, 0) + 1
                if width:
                    w_key = str(round(width, 2))
                    result["vector_summary"]["line_widths"][w_key] = result["vector_summary"]["line_widths"].get(w_key, 0) + 1

            result["vector_summary"]["total_lines"] += lines
            result["vector_summary"]["total_curves"] += curves
            result["vector_summary"]["total_rects"] += rects

            page_data["vector_geometry"] = {
                "lines": lines,
                "curves": curves,
                "rects": rects,
            }
        except Exception:
            page_data["vector_geometry"] = {"lines": 0, "curves": 0, "rects": 0}

        # ── Annotations ──
        for annot in page.annots() or []:
            page_data["annotations"].append({
                "type": annot.type[1],
                "content": annot.info.get("content", "")[:200],
                "rect": list(annot.rect),
            })

        result["pages"].append(page_data)

    doc.close()

    # ── Extract structured data from text ──
    _extract_from_text(all_text, result)

    return result


def _extract_from_text(text: str, result: Dict):
    """Extract equipment tags, scales, dimensions from combined text."""

    # Scale references
    for m in re.finditer(r"(?:scale|SCALE)\s*[:=]?\s*1\s*:\s*(\d+)", text, re.IGNORECASE):
        result["scale_references"].append(f"1:{m.group(1)}")
    result["scale_references"] = list(set(result["scale_references"]))

    # Equipment tags
    tag_pattern = r"\b(?:AHU|FCU|AC|BC|VCD|FD|SD|FSD|EF|TEF|KEF|DB|MDB|MSB|P|CH|CHP|CAL|PHE|PU|EV|ATT|MVHR|IF|NRD)-?\d{1,3}(?:-\d{1,3})?\b"
    tags = re.findall(tag_pattern, text, re.IGNORECASE)
    result["equipment_tags"] = sorted(set(t.upper() for t in tags))

    # Size annotations (Ø315, DN50, 600x400)
    for m in re.finditer(r"(?:Ø|DN|dia|diameter)\s*(\d{2,4})", text, re.IGNORECASE):
        result["size_annotations"].append(m.group(0).strip())
    for m in re.finditer(r"\d{2,4}\s*[x×]\s*\d{2,4}", text):
        result["size_annotations"].append(m.group(0).strip())
    result["size_annotations"] = list(set(result["size_annotations"]))

    # Dimension hints with units
    for m in re.finditer(r"\d+\.?\d*\s*(?:m²|m\b|mm\b|nr\b|no\.?\b)", text, re.IGNORECASE):
        result["dimension_hints"].append(m.group(0).strip())
    result["dimension_hints"] = list(set(result["dimension_hints"][:30]))

    # Drawing numbers
    for m in re.finditer(r"[A-Z]{1,3}\d{2,5}[-/][A-Z0-9-]{3,}", text):
        result["drawing_numbers"].append(m.group(0))
    result["drawing_numbers"] = list(set(result["drawing_numbers"]))

    # Revisions
    for m in re.finditer(r"(?:Rev|REV|Revision)\s*[.:=]?\s*([A-Z]\d{0,2}|\d{1,3})", text, re.IGNORECASE):
        result["revisions"].append(m.group(0).strip())
    result["revisions"] = list(set(result["revisions"]))


# ═══════════════════════════════════════════════
# CV SYMBOL DETECTION (Roboflow stub)
# ═══════════════════════════════════════════════

def detect_symbols(image_bytes: bytes, confidence: float = 0.65) -> Dict[str, Any]:
    """
    Run CV symbol detection on a drawing image.
    Currently a stub — returns empty results.
    When Roboflow model is trained, replace with real inference.
    """
    # TODO: Replace with Roboflow inference when model is trained
    # from roboflow import Roboflow
    # rf = Roboflow(api_key=os.environ.get("ROBOFLOW_API_KEY"))
    # project = rf.workspace("contraq").project("mep-takeoff")
    # model = project.version(1).model
    # prediction = model.predict(image_bytes, confidence=confidence, overlap=30)

    return {
        "cv_available": False,
        "message": "CV model not yet trained. Using Claude vision for detection.",
        "raw_detections": [],
        "grouped_counts": {},
        "total_items_detected": 0,
        "cv_confidence_avg": 0,
    }


def render_page_to_image(pdf_bytes: bytes, page_num: int = 0, dpi: int = 300) -> bytes:
    """Render a PDF page to a PNG image at the specified DPI."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if page_num >= len(doc):
        raise ValueError(f"Page {page_num} does not exist (PDF has {len(doc)} pages)")

    page = doc[page_num]
    mat = fitz.Matrix(dpi / 72, dpi / 72)  # 72 DPI is the PDF default
    pix = page.get_pixmap(matrix=mat, alpha=False)
    image_bytes = pix.tobytes("png")
    doc.close()
    return image_bytes


# ═══════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════

@app.get("/health")
async def health():
    return {"status": "ok", "service": "contraq-cv", "version": "1.0.0", "cv_model_ready": False}


@app.post("/preprocess")
async def preprocess_endpoint(file: UploadFile = File(...)):
    """Extract text, vectors, and annotations from a PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 50 * 1024 * 1024:
        raise HTTPException(400, "File exceeds 50MB limit")

    result = preprocess_pdf(pdf_bytes)
    return JSONResponse(content={"success": True, **result})


@app.post("/detect")
async def detect_endpoint(file: UploadFile = File(...), confidence: float = 0.65, dpi: int = 300):
    """Run CV symbol detection on a PDF drawing."""
    pdf_bytes = await file.read()

    # Render to image
    image_bytes = render_page_to_image(pdf_bytes, page_num=0, dpi=dpi)

    # Run detection
    cv_result = detect_symbols(image_bytes, confidence=confidence)

    # Also return the rendered image as base64 (for Claude to use)
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    return JSONResponse(content={
        "success": True,
        "cv_results": cv_result,
        "rendered_image_b64": image_b64,
        "rendered_dpi": dpi,
        "image_size_kb": round(len(image_bytes) / 1024, 1),
    })


@app.post("/full")
async def full_pipeline_endpoint(file: UploadFile = File(...), dpi: int = 300):
    """Full pre-processing + detection in one call."""
    pdf_bytes = await file.read()

    # Pre-process
    preprocessed = preprocess_pdf(pdf_bytes)

    # Render to high-res image
    image_bytes = render_page_to_image(pdf_bytes, page_num=0, dpi=dpi)
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # CV detection (stub for now)
    cv_result = detect_symbols(image_bytes)

    return JSONResponse(content={
        "success": True,
        "preprocessed": preprocessed,
        "cv_results": cv_result,
        "rendered_image_b64": image_b64,
        "rendered_dpi": dpi,
        "image_size_kb": round(len(image_bytes) / 1024, 1),
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
