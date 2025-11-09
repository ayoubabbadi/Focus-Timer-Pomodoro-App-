# Focus.io - A Creative Pomodoro Timer

A clean, creative, and responsive Pomodoro timer designed to help you focus. This app is built with classic HTML, CSS, and JavaScript, keeping the project simple, organized, and easy to modify.





##  How to Run

This project is built with standard web technologies. No compilers or build tools are needed.

1.  **Download:** Make sure you have all three files in the same folder:
    * `index.html`
    * `style.css`
    * `app.js`
2.  **Open:** Double-click the `index.html` file to open it in your favorite web browser (like Chrome, Firefox, or Edge).

That's it! The app will run.

> **Note on Permissions:** The app uses:
> * **Desktop Notifications:** To alert you when a timer finishes.
> * **Audio:** To play the alarm and ambient sounds.
>
> Your browser will likely ask you to "Allow" these features. Please do so for the best experience.



##  Features

* **Dynamic Gradient Themes:** The UI beautifully changes color based on your mode.
    * **Focus:** A warm, encouraging "sunset" gradient.
    * **Break:** A calm, refreshing "ocean" gradient.
* **Full Pomodoro Logic:** Standard 25/5/15-minute cycles (Focus, Short Break, Long Break).
* **Custom Settings:** Click the **`⚙️` (gear)** icon to change the duration of all timers and the number of sessions before a long break. All settings are saved in your browser's `localStorage`.
* **Ambient Sounds:** Click the **`🎵` (music)** icon to open the sound menu.
    * Play four different background sounds (Rain, Forest, Coffee Shop, White Noise).
    * Control the volume with the built-in slider.
* **Desktop Notifications:** Get a native OS notification when your timer is up, even if the window is minimized.
* **Fully Responsive:** The design looks great on both large desktop screens and small mobile phones.



##  Technology Stack

* **HTML5:** (`index.html`) The core content and structure.
* **CSS3:** (`style.css`) All styling, animations, and responsive design.
* **JavaScript (ES6+):** (`app.js`) All application logic, including the timer, settings, sound, and DOM manipulation.
* **Font Awesome:** For all icons, loaded via CDN.



##  File Structure

The project is organized into three main files for a clean separation of concerns: