import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("connection established")

@sio.on('hr_question')
def on_message(data):
    print("AI Question:", data)

@sio.on('final_report')
def on_report(data):
    print("Final Report received:", data)
    sio.disconnect()

@sio.event
def disconnect():
    print("disconnected from server")

try:
    sio.connect('http://localhost:5001')
    # 1. Start interview
    sio.emit('user_answer', {'role': 'React Developer', 'text': '', 'user_id': 1})
    time.sleep(2)
    
    # 2. Answer a question
    sio.emit('user_answer', {'role': 'React Developer', 'text': 'React uses a Virtual DOM to minimize actual DOM manipulation.', 'user_id': 1})
    time.sleep(2)
    
    # 3. Generate Report
    sio.emit('generate_report', {'role': 'React Developer'})
    time.sleep(5) # wait for LLM/Mock report
    
except Exception as e:
    print(f"Failed to connect: {e}")
finally:
    if sio.connected:
        sio.disconnect()
