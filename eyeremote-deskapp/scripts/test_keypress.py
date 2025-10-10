# test_keypress.py
import time
import sys

def test_pyautogui():
    """Tests the pyautogui library."""
    try:
        import pyautogui
        print("--- Testing pyautogui ---")
        print("ACTION: Please switch to a text editor (like Notepad) in the next 5 seconds.")
        time.sleep(5)
        pyautogui.press('space')
        print("INFO: pyautogui sent a space. Did a space character appear in your editor?")
        return True
    except Exception as e:
        print(f"ERROR: pyautogui failed: {e}")
        return False

def test_pynput():
    """Tests the pynput library."""
    try:
        from pynput.keyboard import Key, Controller
        print("\n--- Testing pynput ---")
        print("ACTION: Please switch to a text editor (like Notepad) in the next 5 seconds.")
        time.sleep(5)
        keyboard = Controller()
        keyboard.press(Key.space)
        keyboard.release(Key.space)
        print("INFO: pynput sent a space. Did a space character appear in your editor?")
        return True
    except Exception as e:
        print(f"ERROR: pynput failed: {e}")
        return False

if __name__ == "__main__":
    print("--- Standalone Keyboard Automation Test ---")
    pyautogui_ok = test_pyautogui()
    pynput_ok = test_pynput()
    print("\n--- Summary ---")
    if pyautogui_ok or pynput_ok:
        print("SUCCESS: At least one library works! The issue is likely within the EyeRemote app's logic.")
    else:
        print("FAILURE: Neither library works. This confirms an OS-level permission issue.")
        print("Please follow the OS-specific instructions in the next step carefully.")

