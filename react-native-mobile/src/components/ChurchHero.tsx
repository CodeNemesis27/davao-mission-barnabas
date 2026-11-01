import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

// The illustration is drawn on a 360 x 200 canvas and scaled to the screen width.
const VIEWBOX_W = 360;
const VIEWBOX_H = 200;
const SUN = { x: 180, y: 122 };

/**
 * A little church silhouette with glowing windows against a rising sun.
 * Drawn with SVG shapes, so it stays sharp on every screen and needs no image files.
 */
export default function ChurchHero() {
  const { width } = useWindowDimensions();
  const scale = width / VIEWBOX_W;
  const height = VIEWBOX_H * scale;

  // The sun's glow breathes in and out.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const glowSize = 250 * scale;

  return (
    <View style={{ width, height, pointerEvents: 'none' }}>
      {/* Pulsing glow behind the sun */}
      <Animated.View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          left: SUN.x * scale - glowSize / 2,
          top: SUN.y * scale - glowSize / 2,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) }],
        }}
      >
        <Svg width={glowSize} height={glowSize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="pulseGlow" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFE7A0" stopOpacity="0.9" />
              <Stop offset="0.45" stopColor="#FFB347" stopOpacity="0.38" />
              <Stop offset="1" stopColor="#F2762E" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#pulseGlow)" />
        </Svg>
      </Animated.View>

      <Svg width={width} height={height} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}>
        <Defs>
          <SvgLinearGradient id="nearHill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1B1450" />
            <Stop offset="1" stopColor="#0B0A2A" />
          </SvgLinearGradient>
        </Defs>

        {/* Sun */}
        <Circle cx={SUN.x} cy={SUN.y} r="36" fill="#FFD369" />

        {/* Far and near hills */}
        <Path
          d="M0 160 C 50 132, 110 138, 160 158 C 220 134, 290 130, 360 156 L360 200 L0 200 Z"
          fill="#2A1A6B"
          opacity="0.9"
        />
        <Path
          d="M0 178 C 70 156, 130 170, 190 176 C 250 160, 310 164, 360 176 L360 200 L0 200 Z"
          fill="url(#nearHill)"
        />

        {/* Church silhouette */}
        <G fill="#0A0828">
          {/* side wings */}
          <Rect x="116" y="144" width="30" height="40" />
          <Polygon points="112,146 131,128 150,146" />
          <Rect x="214" y="144" width="30" height="40" />
          <Polygon points="210,146 229,128 248,146" />
          {/* main hall */}
          <Rect x="142" y="120" width="76" height="64" />
          <Polygon points="136,122 180,92 224,122" />
          {/* bell tower and spire */}
          <Rect x="167" y="64" width="26" height="40" />
          <Polygon points="163,66 180,34 197,66" />
          {/* cross */}
          <Rect x="178.2" y="14" width="3.6" height="24" />
          <Rect x="172" y="20" width="16" height="3.6" />
        </G>

        {/* Glowing windows and door */}
        <G fill="#FFD369">
          <Path d="M171 184 V164 A9 9 0 0 1 189 164 V184 Z" />
          <Circle cx="180" cy="112" r="6" />
          <Path d="M175.5 98 V84 A4.5 4.5 0 0 1 184.5 84 V98 Z" />
          <Path d="M127 168 V160 A4 4 0 0 1 135 160 V168 Z" />
          <Path d="M225 168 V160 A4 4 0 0 1 233 160 V168 Z" />
          <Path d="M152 150 V142 A3.5 3.5 0 0 1 159 142 V150 Z" />
          <Path d="M201 150 V142 A3.5 3.5 0 0 1 208 142 V150 Z" />
        </G>
      </Svg>
    </View>
  );
}
