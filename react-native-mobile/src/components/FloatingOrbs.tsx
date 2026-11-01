import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type OrbSpec = {
  size: number;
  left: number; // % of width
  top: number; // % of height
  color: string;
  duration: number;
  travel: number;
};

const ORBS: OrbSpec[] = [
  { size: 96, left: -8, top: 14, color: 'rgba(255, 211, 105, 0.13)', duration: 5200, travel: 18 },
  { size: 58, left: 80, top: 8, color: 'rgba(255, 154, 60, 0.16)', duration: 4300, travel: 14 },
  { size: 130, left: 62, top: 36, color: 'rgba(142, 62, 151, 0.24)', duration: 6100, travel: 22 },
  { size: 44, left: 14, top: 46, color: 'rgba(255, 255, 255, 0.08)', duration: 3800, travel: 12 },
];

function Orb({ size, left, top, color, duration, travel }: OrbSpec) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, duration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -travel] }) }],
      }}
    />
  );
}

/** Soft glowing bubbles that drift slowly, giving the hero some depth. */
export default function FloatingOrbs() {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {ORBS.map((orb, index) => (
        <Orb key={index} {...orb} />
      ))}
    </View>
  );
}
