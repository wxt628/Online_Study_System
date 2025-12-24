import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

export const showToast = (message, type = 'info') => {
    const backgroundColor = type === 'success' ? '#4CAF50' : 
                            type === 'error' ? '#FF6B6B' : 
                            type === 'info' ? '#3498db' : '#FFB347';
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true,
    }).showToast();
}