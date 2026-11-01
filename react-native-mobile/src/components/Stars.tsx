import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type StarSpec = { x: number; y: number; size: number; delay: number };

// Positions are percentages of the sky area (kept in the upper part of the hero).
const STARS: StarSpec[] = [
  { x: 7, y: 6, size: 3, delay: 0 },
  { x: 18, y: 14, size: 2, delay: 600 },
  { x: 29, y: 5, size: 2.5, delay: 1200 },
  { x: 41, y: 17, size: 2, delay: 300 },
  { x: 52, y: 7, size: 3, delay: 900 },
  { x: 63, y: 15, size: 2, delay: 1500 },
  { x: 74, y: 4, size: 2.5, delay: 450 },
  { x: 85, y: 13, size: 3, delay: 1050 },
  { x: 93, y: 24, size: 2, delay: 200 },
  { x: 11, y: 30, size: 2, delay: 1350 },
  { x: 34, y: 33, size: 1.5, delay: 750 },
  { x: 58, y: 29, size: 1.5, delay: 150 },
  { x: 80, y: 34, size: 2, delay: 1650 },
];

function Star({ x, y, size, delay }: StarSpec) {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1300,
          delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
}

/** A field of softly twinkling stars drawn behind the hero content. */
export default function Stars() {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {STARS.map((star, index) => (
        <Star key={index} {...star} />
      ))}
    </View>
  );
}
