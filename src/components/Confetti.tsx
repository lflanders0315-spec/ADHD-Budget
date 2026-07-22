import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
}

function generateParticles(colors: string[]): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 10,
    delay: Math.random() * 400,
    rotation: Math.random() * 360,
  }));
}

interface ParticleViewProps {
  particle: Particle;
  onComplete: () => void;
  reducedMotion: boolean;
}

function ParticleView({ particle, onComplete, reducedMotion }: ParticleViewProps) {
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      // Skip animation entirely — just show briefly then hide
      scale.value = 0;
      opacity.value = 0;
      if (particle.id === 0) {
        runOnJS(onComplete)();
      }
      return;
    }

    scale.value = withDelay(particle.delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(particle.delay,
      withTiming(SCREEN_HEIGHT + 40, { duration: 1800 + Math.random() * 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    rotate.value = withDelay(particle.delay,
      withTiming(particle.rotation + (Math.random() > 0.5 ? 360 : -360), { duration: 1800, easing: Easing.linear })
    );
    opacity.value = withDelay(particle.delay + 1200,
      withTiming(0, { duration: 600 }, (finished) => {
        if (finished && particle.id === 0) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{
        position: "absolute", left: particle.x, top: -20,
        width: particle.size, height: particle.size * 1.4,
        borderRadius: 2, backgroundColor: particle.color,
      }, style]}
    />
  );
}

interface ConfettiProps {
  visible: boolean;
  onComplete?: () => void;
}

export function Confetti({ visible, onComplete }: ConfettiProps) {
  const { colors } = useTheme();
  const { reducedMotion } = useAccessibility();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  const PARTICLE_COLORS = [
    colors.primary, colors.primaryLight, colors.accent, colors.accentLight,
    colors.statusPaid, colors.statusDue, colors.statusUpcoming,
    colors.info, colors.success, colors.warning,
  ];

  useEffect(() => {
    if (visible) {
      setParticles(generateParticles(PARTICLE_COLORS));
      setShow(true);
    } else {
      setShow(false);
      setParticles([]);
    }
  }, [visible]);

  const handleComplete = () => {
    setShow(false);
    onComplete?.();
  };

  if (!show) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      {particles.map((p) => (
        <ParticleView key={p.id} particle={p} onComplete={handleComplete} reducedMotion={reducedMotion} />
      ))}
    </Animated.View>
  );
}
