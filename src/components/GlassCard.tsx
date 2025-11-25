import React from 'react';
import { Box, type BoxProps } from '@mui/material';
import { motion } from 'framer-motion';

interface GlassCardProps extends BoxProps {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, hoverEffect = false, sx, ...props }) => {
  return (
    <Box
      component={motion.div}
      className="liquid-glass"
      whileHover={hoverEffect ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      sx={{
        borderRadius: 4,
        padding: 2,
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
