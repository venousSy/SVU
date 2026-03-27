from fpdf import FPDF
import os

def create_lecture_pdf(filename, title, content):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Arial", 'B', 24)
    pdf.cell(200, 20, txt=title, ln=True, align='C')
    pdf.ln(10)
    
    # Body
    pdf.set_font("Arial", size=12)
    for section_title, section_text in content.items():
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt=section_title, ln=True)
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, txt=section_text)
        pdf.ln(5)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    pdf.output(filename)
    print(f"Created {filename}")

# Lecture 1: AI
ai_content = {
    "1. Introduction to AI": "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction.",
    "2. Machine Learning": "Machine Learning is a subset of AI that focuses on building systems that learn from data and improve their performance over time without being explicitly programmed.",
    "3. Neural Networks": "Neural networks are a series of algorithms that endeavor to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.",
    "4. Conclusion": "AI is transforming every industry, from healthcare to finance, and will continue to be a major driver of innovation in the coming years."
}

# Lecture 2: Database Systems
db_content = {
    "1. Overview of DBMS": "A Database Management System (DBMS) is software for storing and retrieving users' data while considering appropriate security measures.",
    "2. Relational Databases": "Relational databases use a structure that allows us to identify and access data in relation to another piece of data in the database.",
    "3. SQL Language": "Structured Query Language (SQL) is a standard language for managing and manipulating databases.",
    "4. ACID Properties": "ACID (Atomicity, Consistency, Isolation, Durability) is a set of properties that guarantee database transactions are processed reliably."
}

if __name__ == "__main__":
    create_lecture_pdf("tests/samples/lecture_ai.pdf", "Lecture 1: Introduction to AI", ai_content)
    create_lecture_pdf("tests/samples/lecture_db.pdf", "Lecture 2: Database Systems", db_content)
