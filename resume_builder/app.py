import os
from flask import Flask, render_template, request, make_response
import io
from flask import Flask, render_template, request, make_response
from xhtml2pdf import pisa

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    form_data = {
        "name": request.form.get('name'),
        "contact": request.form.get('contact'),
        "address": request.form.get('address'),
        "summary": request.form.get('summary'),
        
        # Zip tags and URLs for the links section
        "links_data": zip(
            request.form.getlist('link_tag'),
            request.form.getlist('link_url')
        ),
        
        "education": zip(
            request.form.getlist('edu_inst'),
            request.form.getlist('edu_year'),
            request.form.getlist('edu_desc')
        ),
        "experience": zip(
            request.form.getlist('exp_company'),
            request.form.getlist('exp_date'),
            request.form.getlist('exp_role'),
            request.form.getlist('exp_desc')
        ),
        
        "skills_lang": request.form.get('skills_lang'),
        "skills_aoi": request.form.get('skills_aoi'),
        "skills_tools": request.form.get('skills_tools'),
        "languages": request.form.get('languages')
    }

    rendered_html = render_template('resume.html', **form_data)
    
    # Generate PDF using xhtml2pdf
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.StringIO(rendered_html), dest=pdf_buffer)
    
    if pisa_status.err:
        return "Error generating PDF", 500

    pdf = pdf_buffer.getvalue()
    pdf_buffer.close()

    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=Resume.pdf'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5003)