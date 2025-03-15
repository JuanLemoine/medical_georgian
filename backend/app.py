from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import recorder
import json
import time
import threading
import os

app = Flask(__name__)
# More permissive CORS settings for development
CORS(app, resources={r"/*": {"origins": "*"}})

# Add a test endpoint for diagnostics
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "API is working"})

# Rest of your 
# Initialize the recorder
recorder.initialize_audio()

# Status variables
recording_status = {
    "is_recording": False,
    "start_time": None,
    "elapsed_time": 0
}

# Background recording thread
recording_thread = None
@app.route('/api/test', methods=['GET'])

def background_recording():
    """Background thread for continuous recording"""
    global recording_status
    
    while recording_status["is_recording"]:
        recorder.record_chunk()
        time.sleep(0.01)  # Small delay to prevent CPU overload
        
        # Update elapsed time
        if recording_status["start_time"]:
            recording_status["elapsed_time"] = time.time() - recording_status["start_time"]

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the current recording status"""
    return jsonify({
        "is_recording": recording_status["is_recording"],
        "elapsed_time": recording_status["elapsed_time"]
    })

@app.route('/api/start-recording', methods=['POST'])
def start_recording():
    """Start the recording process"""
    global recording_status, recording_thread
    
    if not recording_status["is_recording"]:
        # Start recording
        recorder.start_recording()
        
        # Update status
        recording_status["is_recording"] = True
        recording_status["start_time"] = time.time()
        recording_status["elapsed_time"] = 0
        
        # Start background thread for recording
        recording_thread = threading.Thread(target=background_recording)
        recording_thread.daemon = True
        recording_thread.start()
        
        return jsonify({"status": "recording_started", "time": 0})
    
    return jsonify({"status": "already_recording", "time": recording_status["elapsed_time"]})

@app.route('/api/stop-recording', methods=['POST'])
def stop_recording():
    """Stop recording and process"""
    global recording_status, recording_thread
    
    if recording_status["is_recording"]:
        # Update status first
        recording_status["is_recording"] = False
        
        # Wait for thread to complete
        if recording_thread and recording_thread.is_alive():
            recording_thread.join(timeout=1.0)
        
        # Stop the recording
        result = recorder.stop_recording()
        
        # Reset status
        recording_status["start_time"] = None
        recording_status["elapsed_time"] = 0
        
        return jsonify({"status": "processing_started", "filename": result.get("filename")})
    
    return jsonify({"status": "not_recording"})

@app.route('/api/process', methods=['POST'])
def process_recording():
    """Process the recording and generate form data"""
    data = request.json
    filename = data.get('filename')
    
    if not filename:
        return jsonify({"error": "No filename provided"}), 400
    
    # Process the recording
    result = recorder.process_recording(filename)
    
    return jsonify(result)

@app.route('/api/get-form', methods=['GET'])
def get_form():
    """Get the form data"""
    try:
        with open("filled_form100.json", "r", encoding="utf-8") as file:
            form_data = json.load(file)
        return jsonify(form_data)
    except FileNotFoundError:
        return jsonify({"error": "Form data not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-transcription', methods=['GET'])
def get_transcription():
    """Get the raw transcription text"""
    try:
        with open("transcription.txt", "r", encoding="utf-8") as file:
            transcription = file.read()
        return jsonify({"transcription": transcription})
    except FileNotFoundError:
        return jsonify({"error": "Transcription not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-form', methods=['POST'])
def save_form():
    """Save the edited form data"""
    try:
        form_data = request.json
        
        with open("filled_form100.json", "w", encoding="utf-8") as file:
            json.dump(form_data, file, ensure_ascii=False, indent=4)
        
        return jsonify({"status": "form_saved"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Get the audio file"""
    if os.path.exists(filename):
        return send_file(filename, mimetype='audio/wav')
    return jsonify({"error": "Audio file not found"}), 404

@app.errorhandler(Exception)
def handle_error(e):
    """Global error handler"""
    print(f"Error: {e}")
    return jsonify({"error": str(e)}), 500

# Update your app.py to include these changes at the bottom
if __name__ == '__main__':
    # Allow connections from any IP address, not just localhost
    app.run(debug=True, host='0.0.0.0', port=5001)