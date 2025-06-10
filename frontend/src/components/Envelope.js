import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Envelope = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [flowers, setFlowers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const createFlowers = () => {
      const newFlowers = [];
      const numFlowers = 50; // Reduced number of flowers
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Create a simple grid
      const rows = 5;
      const cols = 10;
      const cellWidth = viewportWidth / cols;
      const cellHeight = viewportHeight / rows;

      for (let i = 0; i < numFlowers; i++) {
        // Calculate position based on grid
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        // Add some randomness within the cell
        const x = (col * cellWidth) + (Math.random() * cellWidth * 0.8);
        const y = (row * cellHeight) + (Math.random() * cellHeight * 0.8);

        newFlowers.push({
          id: i,
          x,
          y,
          scale: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          delay: Math.random() * 2,
          duration: 3 + Math.random() * 4,
          type: (i % 3) + 1
        });
      }

      return newFlowers;
    };

    setFlowers(createFlowers());
  }, []);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)'
      }}
    >
      {/* Background flowers */}
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            background: `url(/images/flower${flower.type}.png) no-repeat center/contain`,
            opacity: 0.9,
            transform: `scale(${flower.scale})`
          }}
          animate={{
            x: [flower.x, flower.x + (Math.random() * 20 - 10)],
            y: [flower.y, flower.y + (Math.random() * 20 - 10)],
            rotate: [flower.rotation, flower.rotation + 360],
            scale: [flower.scale, flower.scale * 1.1, flower.scale]
          }}
          transition={{
            duration: flower.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: flower.delay
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => !isOpen && setIsOpen(true)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <Box
          sx={{
            // Responsive sizing – scales down smoothly on phones
            width: { xs: '80vw', sm: '700px', md: '800px' },
            // Maintain original 1.6 aspect-ratio instead of hard-coding height
            aspectRatio: '16 / 10',
            position: 'relative',
            background: 'url(/images/envelope.png) no-repeat center/contain',
            transformOrigin: 'center',
            transition: 'transform 0.5s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        <Typography
          variant="h2"
          sx={{
            position: 'absolute',
            top: { xs: '90%', sm: '85%' },
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            width: '100%',
            textAlign: 'center',
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Diala & Ghadir
        </Typography>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999
            }}
          >
            <Box
              component="img"
              src="/rsvp.jpg"
              sx={{
                height: { xs: '60vh', sm: '75vh', md: '750px' },
                width: 'auto',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                objectFit: 'contain'
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/rsvp')}
              sx={{
                position: 'absolute',
                bottom: { xs: '-50px', sm: '-60px' },
                left: '50%',
                transform: 'translateX(-50%)',
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '1rem', sm: '1.2rem' },
                borderRadius: '30px',
                background: 'linear-gradient(45deg, #FFB6C1 30%, #FFC0CB 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFC0CB 30%, #FFB6C1 90%)',
                  transform: 'translateX(-50%) scale(1.05)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              RSVP Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Envelope;