import React, { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';

interface VisualizerBackgroundProps {
  isPlaying: boolean;
  color: string; // The primary color extracted from album art
  frequencyData?: Uint8Array | null;
}

const VisualizerBackground: React.FC<VisualizerBackgroundProps> = ({ isPlaying, color, frequencyData }) => {
  // Generate color variations based on the input color
  const colors = useMemo(() => {
    // Default fallback
    if (!color || !color.startsWith('rgb')) return ['#4a90e2', '#9013fe', '#50e3c2'];

    const rgbValues = color.match(/\d+/g)?.map(Number);
    if (!rgbValues || rgbValues.length !== 3) return [color, color, color];

    const [r, g, b] = rgbValues;

    // Create variations
    const color1 = `rgb(${r}, ${g}, ${b})`;
    const color2 = `rgb(${Math.min(255, r + 40)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 40)})`; // Slightly different
    const color3 = `rgb(${Math.max(0, r - 30)}, ${Math.min(255, g + 50)}, ${Math.max(0, b - 10)})`; // Another variation

    return [color1, color2, color3];
  }, [color]);

  // Animation controls for the blobs
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();

  // Analyze frequency data to drive animation
  useEffect(() => {
    if (frequencyData && isPlaying) {
      // Simple frequency analysis
      // Lows (Bass) -> Blob 1
      // Mids -> Blob 2
      // Highs -> Blob 3
      
      const bufferLength = frequencyData.length;
      const lowBound = Math.floor(bufferLength * 0.1);
      const midBound = Math.floor(bufferLength * 0.5);
      
      const getAverage = (start: number, end: number) => {
        let sum = 0;
        for (let i = start; i < end; i++) {
          sum += frequencyData[i];
        }
        return sum / (end - start);
      };

      const bass = getAverage(0, lowBound) / 255; // 0 to 1
      const mid = getAverage(lowBound, midBound) / 255;
      const treble = getAverage(midBound, bufferLength) / 255;

      // Map to scale (1.0 to 1.5)
      const scale1 = 1 + bass * 0.6;
      const scale2 = 1 + mid * 0.5;
      const scale3 = 1 + treble * 0.5;

      controls1.start({ scale: scale1, transition: { duration: 0.1 } });
      controls2.start({ scale: scale2, transition: { duration: 0.1 } });
      controls3.start({ scale: scale3, transition: { duration: 0.1 } });
    }
  }, [frequencyData, isPlaying, controls1, controls2, controls3]);

  // Fallback / Idle Animation
  useEffect(() => {
    if (!frequencyData || !isPlaying) {
      const duration = isPlaying ? 8 : 15;
      
      controls1.start({
        x: [0, 100, -50, 0],
        y: [0, -80, 60, 0],
        scale: [1, 1.2, 0.9, 1],
        transition: { duration: duration, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
      });
      controls2.start({
        x: [0, -70, 60, 0],
        y: [0, 90, -40, 0],
        scale: [1, 1.1, 0.8, 1],
        transition: { duration: duration * 1.2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
      });
      controls3.start({
        x: [0, 60, -80, 0],
        y: [0, 50, -90, 0],
        scale: [1, 1.3, 0.9, 1],
        transition: { duration: duration * 1.1, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
      });
    }
  }, [isPlaying, frequencyData, controls1, controls2, controls3]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        background: '#000',
      }}
    >
      {/* Blur Container */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(80px)',
          opacity: 0.6,
        }}
      >
        {/* Blob 1 */}
        <motion.div
          animate={controls1}
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: colors[0],
            opacity: 0.7,
          }}
        />

        {/* Blob 2 */}
        <motion.div
          animate={controls2}
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '45vw',
            height: '45vw',
            borderRadius: '50%',
            background: colors[1],
            opacity: 0.6,
          }}
        />

        {/* Blob 3 */}
        <motion.div
          animate={controls3}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '30%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: colors[2],
            opacity: 0.5,
          }}
        />
      </Box>
      
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)' }} />
    </Box>
  );
};

export default VisualizerBackground;
