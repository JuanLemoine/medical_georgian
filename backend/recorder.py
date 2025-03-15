import pyaudio
import wave
import uuid
import time
import json
import os
from io import BytesIO
import requests
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from openai import OpenAI

# Load environment variables
load_dotenv()

# OpenAI Client Setup
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# ElevenLabs Client Setup
elevenlabs_client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

# Recording parameters
CHUNK = 1024
FORMAT = pyaudio.paInt16
RATE = 44100
CHANNELS = 2
RECORD_SECONDS = 160

# Initialize global variables
stream = None
frames = []
p = None
is_recording = False
current_filename = None

def initialize_audio():
    """Initialize PyAudio"""
    global p, CHANNELS
    p = pyaudio.PyAudio()
    device_info = p.get_default_input_device_info()
    max_input_channels = device_info.get('maxInputChannels', 1)
    CHANNELS = 2 if max_input_channels >= 2 else 1
    return p

def start_recording():
    """Start recording audio"""
    global stream, frames, p, is_recording
    
    if p is None:
        p = initialize_audio()
    
    # Reset frames
    frames = []
    
    # Open audio stream
    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)
    
    is_recording = True
    
    # Return a status message
    return {"status": "recording_started"}

def record_chunk():
    """Record a single chunk of audio"""
    global stream, frames, is_recording
    
    if stream and is_recording:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)
            return True
        except Exception as e:
            print(f"Error recording chunk: {e}")
            return False
    return False

def stop_recording():
    """Stop recording and save audio to file"""
    global stream, frames, p, is_recording, current_filename
    
    is_recording = False
    
    if stream:
        stream.stop_stream()
        stream.close()
        stream = None
    
    # Save the recorded audio as a WAV file
    filename = f"recording_{uuid.uuid4().hex}.wav"
    current_filename = filename
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
    
    return {"status": "recording_stopped", "filename": filename}

def process_recording(filename=None):
    """Process the recording and generate form data"""
    if filename is None:
        filename = current_filename
        
    if not filename or not os.path.exists(filename):
        return {"error": "Recording file not found"}
    
    try:
        # Perform transcription with ElevenLabs
        print("Transcribing with ElevenLabs...")
        with open(filename, "rb") as audio_file:
            audio_data = BytesIO(audio_file.read())
        
        transcription = elevenlabs_client.speech_to_text.convert(
            file=audio_data,
            model_id="scribe_v1",  # Use appropriate model
            tag_audio_events=True,  # Tag audio events
            language_code="kat",    # Georgian language code
            diarize=True,           # Annotate speakers
        )
        
        # Save the transcription to a file
        with open("transcription.txt", "w", encoding="utf-8") as f:
            f.write(transcription.text)
        
        aggregated_transcriptions = transcription.text
        
        # Updated JSON structure
        original_json = {
            "document": "ფორმა 100 - განახლებული",
            "sections": [
                {"title": "გაცემის მიზანი", "content": ""},
                {"title": "პაციენტის სრული სახელი", "content": ""},
                {"title": "დაბადების თარიღი", "content": ""},
                {"title": "სქესი (მამრობითი / მდედრობითი)", "content": ""},
                {"title": "პირადი საიდენტიფიკაციო ნომერი", "content": ""},
                {"title": "მისამართი", "content": ""},
                {"title": "სამკურნალო დაწესებულების სახელი", "content": ""},
                {"title": "სამედიცინო ვიზიტის თარიღი", "content": ""},
                {
                    "title": "დიაგნოზი",
                    "subsections": [
                        {"title": "ა) საწყისი დიაგნოზი", "content": ""},
                        {"title": "ბ) დამატებითი ინფორმაცია", "content": ""},
                        {"title": "გ) საბოლოო დიაგნოზი", "content": ""},
                        {"title": "დ) ჩატარებული მკურნალობა", "content": ""}
                    ]
                },
                {"title": "პაციენტის სიმპტომები", "content": ""},
                {
                    "title": "მკურნალობის რეკომენდაციები",
                    "subsections": [
                        {"title": "ა) მედიკამენტები", "content": ""},
                        {"title": "ბ) თერაპიული პროცედურები", "content": ""},
                        {"title": "გ) დიეტური რეკომენდაციები", "content": ""},
                        {"title": "დ) ფიზიკური აქტივობის რეკომენდაციები", "content": ""},
                        {"title": "ე) დამატებითი საჭირო გამოკვლევები", "content": ""}
                    ]
                },
                {
                    "title": "სამედიცინო ისტორია",
                    "subsections": [
                        {"title": "ა) წარსულში გადატანილი დაავადებები", "content": ""},
                        {"title": "ბ) ალერგიები", "content": ""},
                        {"title": "გ) ოჯახის სამედიცინო ისტორია", "content": ""}
                    ]
                },
                {"title": "რისკის შეფასება და პროფილაქტიკური ზომები", "content": ""},
                {"title": "ექიმის სრული სახელი", "content": ""},
                {"title": "ექიმის ხელმოწერა", "content": ""},
                {"title": "დამატებითი შენიშვნები", "content": ""}
            ]
        }
        
        # Analyze the transcription with OpenAI
        filled_form = analyze_medical_transcription(aggregated_transcriptions, original_json)
        
        # Save the filled form to a JSON file
        with open("filled_form100.json", "w", encoding="utf-8") as outfile:
            json.dump(filled_form, outfile, ensure_ascii=False, indent=4)
        
        return filled_form
    
    except Exception as e:
        print(f"Error processing recording: {e}")
        return {"error": str(e)}

def background_recording():
    """Background thread for continuous recording"""
    global recording_status
    
    start_time = time.time()
    max_duration = 180  # 3 minutes in seconds
    
    while recording_status["is_recording"]:
        recorder.record_chunk()
        time.sleep(0.01)  # Small delay to prevent CPU overload
        
        # Update elapsed time
        current_time = time.time()
        elapsed = current_time - start_time
        recording_status["elapsed_time"] = elapsed
        
        # Stop if reached maximum duration
        if elapsed >= max_duration:
            recording_status["is_recording"] = False
            print("Maximum recording duration reached. Stopping...")
            break

def analyze_medical_transcription(aggregated_transcriptions, original_json):
    """Analyze the transcription using OpenAI and fill the form"""
    # Create a model specifically for the parsing output with updated fields
    class Form100Content(BaseModel):
        document_purpose: str = Field(description="გაცემის მიზანი - Purpose of the document")
        patient_name: str = Field(description="პაციენტის სრული სახელი - Patient's full name")
        birth_date: str = Field(description="დაბადების თარიღი - Date of birth (in format: DD.MM.YYYY)")
        gender: str = Field(description="სქესი (მამრობითი / მდედრობითი) - Gender (male/female)")
        personal_id: str = Field(description="პირადი საიდენტიფიკაციო ნომერი - Personal ID number")
        address: str = Field(description="მისამართი - Address")
        medical_institution: str = Field(description="სამკურნალო დაწესებულების სახელი - Name of medical institution")
        visit_date: str = Field(description="სამედიცინო ვიზიტის თარიღი - Date of medical visit (in format: DD.MM.YYYY)")
        primary_diagnosis: str = Field(description="ა) საწყისი დიაგნოზი - Initial diagnosis")
        additional_info: str = Field(description="ბ) დამატებითი ინფორმაცია - Additional information")
        final_diagnosis: str = Field(description="გ) საბოლოო დიაგნოზი - Final diagnosis")
        treatment_used: str = Field(description="დ) ჩატარებული მკურნალობა - Treatment provided")
        patient_symptoms: str = Field(description="პაციენტის სიმპტომები - Patient's symptoms")
        medications: str = Field(description="ა) მედიკამენტები - Medications")
        therapy_procedures: str = Field(description="ბ) თერაპიული პროცედურები - Therapeutic procedures")
        dietary_recommendations: str = Field(description="გ) დიეტური რეკომენდაციები - Dietary recommendations")
        physical_activity: str = Field(description="დ) ფიზიკური აქტივობის რეკომენდაციები - Physical activity recommendations")
        additional_tests: str = Field(description="ე) დამატებითი საჭირო გამოკვლევები - Additional required examinations")
        past_diseases: str = Field(description="ა) წარსულში გადატანილი დაავადებები - Past diseases")
        allergies: str = Field(description="ბ) ალერგიები - Allergies")
        family_history: str = Field(description="გ) ოჯახის სამედიცინო ისტორია - Family medical history")
        risk_assessment: str = Field(description="რისკის შეფასება და პროფილაქტიკური ზომები - Risk assessment and preventive measures")
        doctor_name: str = Field(description="ექიმის სრული სახელი - Doctor's full name")
        doctor_signature: str = Field(description="ექიმის ხელმოწერა - Doctor's signature (indicate if mentioned)")
        additional_notes: str = Field(description="დამატებითი შენიშვნები - Additional notes")
    
    # Prepare the updated system prompt in Georgian
    system_prompt = """
    თქვენ ხართ სამედიცინო დოკუმენტაციის ასისტენტი, სპეციალიზებული ქართული სამედიცინო ფორმების შევსებაში.
    თქვენი დავალებაა ყურადღებით გააანალიზოთ მოწოდებული ექიმსა და პაციენტს შორის საუბრის ჩანაწერი და ამოიღოთ ყველა შესაბამისი ინფორმაცია, რათა შეავსოთ სამედიცინო დოკუმენტი „ფორმა 100".
    ფორმა შეიცავს შემდეგ ველებს:
    - საბუთის გაცემის მიზანი
    - პაციენტის სრული სახელი
    - დაბადების თარიღი
    - სქესი (მამრობითი / მდედრობითი)
    - პირადი საიდენტიფიკაციო ნომერი
    - მისამართი
    - სამკურნალო დაწესებულების სახელი
    - სამედიცინო ვიზიტის თარიღი
    - დიაგნოზი, ქვეპუნქტებით:
      * ა) საწყისი დიაგნოზი
      * ბ) დამატებითი ინფორმაცია
      * გ) საბოლოო დიაგნოზი
      * დ) ჩატარებული მკურნალობა
    - პაციენტის სიმპტომები
    - მკურნალობის რეკომენდაციები, ქვეპუნქტებით:
      * ა) მედიკამენტები
      * ბ) თერაპიული პროცედურები
      * გ) დიეტური რეკომენდაციები
      * დ) ფიზიკური აქტივობის რეკომენდაციები
      * ე) დამატებითი საჭირო გამოკვლევები
    - სამედიცინო ისტორია, ქვეპუნქტებით:
      * ა) წარსულში გადატანილი დაავადებები
      * ბ) ალერგიები
      * გ) ოჯახის სამედიცინო ისტორია
    - რისკის შეფასება და პროფილაქტიკური ზომები
    - ექიმის სრული სახელი
    - ექიმის ხელმოწერა
    - დამატებითი შენიშვნები
    ქართული ენის შემთხვევაში, შეინარჩუნეთ სახელები და საკუთარი სახელები ისე, როგორც მოცემულია საუბარში.
    თარიღები ჩაწერეთ ფორმატით DD.MM.YYYY.
    თუ ინფორმაცია ტრანსკრიპტში არ არის მოცემული, შესაბამისი ველი დატოვეთ ცარიელი.
    იყავით ზუსტი და გამოიტანეთ მხოლოდ ის ინფორმაცია, რაც მკაფიოდ არის მითითებული ტრანსკრიპტში.
    """
    
    # Make the API call
    completion = openai_client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"საუბრის ამ ჩანაწერის საფუძველზე, ამოიღეთ ინფორმაცია ფორმა 100-ისთვის:\n\n{aggregated_transcriptions}"}
        ],
        response_format=Form100Content,
    )
    
    # Get the parsed content
    parsed_content = completion.choices[0].message.parsed
    
    # Convert to dictionary for easier manipulation
    content_dict = parsed_content.dict()
    
    # Load the original JSON structure
    form_data = original_json.copy()
    
    # Map the parsed content back to the original structure
    for section in form_data["sections"]:
        if section["title"] == "გაცემის მიზანი":
            section["content"] = content_dict["document_purpose"]
        elif section["title"] == "პაციენტის სრული სახელი":
            section["content"] = content_dict["patient_name"]
        elif section["title"] == "დაბადების თარიღი":
            section["content"] = content_dict["birth_date"]
        elif section["title"] == "სქესი (მამრობითი / მდედრობითი)":
            section["content"] = content_dict["gender"]
        elif section["title"] == "პირადი საიდენტიფიკაციო ნომერი":
            section["content"] = content_dict["personal_id"]
        elif section["title"] == "მისამართი":
            section["content"] = content_dict["address"]
        elif section["title"] == "სამკურნალო დაწესებულების სახელი":
            section["content"] = content_dict["medical_institution"]
        elif section["title"] == "სამედიცინო ვიზიტის თარიღი":
            section["content"] = content_dict["visit_date"]
        elif section["title"] == "დიაგნოზი" and "subsections" in section:
            for subsection in section["subsections"]:
                if subsection["title"] == "ა) საწყისი დიაგნოზი":
                    subsection["content"] = content_dict["primary_diagnosis"]
                elif subsection["title"] == "ბ) დამატებითი ინფორმაცია":
                    subsection["content"] = content_dict["additional_info"]
                elif subsection["title"] == "გ) საბოლოო დიაგნოზი":
                    subsection["content"] = content_dict["final_diagnosis"]
                elif subsection["title"] == "დ) ჩატარებული მკურნალობა":
                    subsection["content"] = content_dict["treatment_used"]
        elif section["title"] == "პაციენტის სიმპტომები":
            section["content"] = content_dict["patient_symptoms"]
        elif section["title"] == "მკურნალობის რეკომენდაციები" and "subsections" in section:
            for subsection in section["subsections"]:
                if subsection["title"] == "ა) მედიკამენტები":
                    subsection["content"] = content_dict["medications"]
                elif subsection["title"] == "ბ) თერაპიული პროცედურები":
                    subsection["content"] = content_dict["therapy_procedures"]
                elif subsection["title"] == "გ) დიეტური რეკომენდაციები":
                    subsection["content"] = content_dict["dietary_recommendations"]
                elif subsection["title"] == "დ) ფიზიკური აქტივობის რეკომენდაციები":
                    subsection["content"] = content_dict["physical_activity"]
                elif subsection["title"] == "ე) დამატებითი საჭირო გამოკვლევები":
                    subsection["content"] = content_dict["additional_tests"]
        elif section["title"] == "სამედიცინო ისტორია" and "subsections" in section:
            for subsection in section["subsections"]:
                if subsection["title"] == "ა) წარსულში გადატანილი დაავადებები":
                    subsection["content"] = content_dict["past_diseases"]
                elif subsection["title"] == "ბ) ალერგიები":
                    subsection["content"] = content_dict["allergies"]
                elif subsection["title"] == "გ) ოჯახის სამედიცინო ისტორია":
                    subsection["content"] = content_dict["family_history"]
        elif section["title"] == "რისკის შეფასება და პროფილაქტიკური ზომები":
            section["content"] = content_dict["risk_assessment"]
        elif section["title"] == "ექიმის სრული სახელი":
            section["content"] = content_dict["doctor_name"]
        elif section["title"] == "ექიმის ხელმოწერა":
            section["content"] = content_dict["doctor_signature"]
        elif section["title"] == "დამატებითი შენიშვნები":
            section["content"] = content_dict["additional_notes"]
    
    return form_data

def cleanup():
    """Clean up resources"""
    global p, stream
    
    if stream:
        stream.stop_stream()
        stream.close()
        stream = None
    
    if p:
        p.terminate()
        p = None