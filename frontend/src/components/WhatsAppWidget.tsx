import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import styles from './WhatsAppWidget.module.css';


const WhatsAppWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = '2349039404716'; // Your WhatsApp number without the '+' sign
  const message = 'Hello, I have a question about BitMine Robotics';
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Show the widget after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;
  
  return (
    <div className={styles.whatsappWidget}>
      <div 
        className={styles.tooltipContainer}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <div className={styles.tooltip}>
            Chat with us on WhatsApp
          </div>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappButton}
          aria-label="Chat with us on WhatsApp"
        >
          <FaWhatsapp size={32} />
        </a>
      </div>
    </div>
  );
};

export default WhatsAppWidget;
