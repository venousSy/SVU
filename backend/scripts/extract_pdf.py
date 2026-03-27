import sys
import json
import os
import re
from langchain_opendataloader_pdf import OpenDataLoaderPDFLoader

def clean_markdown(text):
    """
    Heuristics to filter out potential headers, footers, and page numbers.
    """
    lines = text.split('\n')
    cleaned_lines = []
    
    # Simple heuristics for headers/footers:
    # 1. Lines containing only numbers (likely page numbers)
    # 2. Very short lines at the absolute top or bottom of a 'chunk'
    # 3. Repeated titles (though hard to detect without more context)
    
    for line in lines:
        stripped = line.strip()
        
        # Skip empty lines (keep them for structure later if needed, but here we simplify)
        if not stripped:
            cleaned_lines.append("")
            continue
            
        # Skip lines that are just numbers (page numbers)
        if re.match(r'^\d+$', stripped):
            continue
            
        # Skip lines that look like "Page X" or "Page X of Y"
        if re.match(r'^Page \d+( of \d+)?$', stripped, re.IGNORECASE):
            continue
            
        cleaned_lines.append(line)
        
    return '\n'.join(cleaned_lines)

def extract_pdf(file_path):
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        return

    try:
        # Initialize loader with reading_order="xycut"
        # The library documentation suggests using OpenDataLoaderPDFLoader
        loader = OpenDataLoaderPDFLoader(
            file_path, 
            reading_order="xycut",
            output_format="markdown"
        )
        
        # Load documents
        documents = loader.load()
        
        # Combine page contents
        full_text = "\n\n".join([doc.page_content for doc in documents])
        
        # Apply cleaning heuristics
        cleaned_text = clean_markdown(full_text)
        
        # Return as JSON for easy consumption by Node.js
        result = {
            "success": True,
            "filename": os.path.basename(file_path),
            "content": cleaned_text
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    extract_pdf(file_path)
