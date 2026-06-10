import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function FadeInView({ children, duration = 500, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1, duration, delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [duration, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
}

export function SlideInView({ children, duration = 500, delay = 0, from = 'bottom', style }) {
  const translateY = useRef(new Animated.Value(from === 'bottom' ? 50 : -50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialValue = from === 'bottom' ? 50 : -50;
    translateY.setValue(initialValue);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration, delay, useNativeDriver: true }),
    ]).start();
  }, [duration, delay, from]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function ScaleInView({ children, duration = 400, delay = 0, style }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0.8);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration, delay, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration, delay, useNativeDriver: true }),
    ]).start();
  }, [duration, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function StaggeredList({ children, staggerDelay = 100, baseDelay = 0, maxAnimated = 10 }) {
  // Otimização: limitar animação aos primeiros N itens para evitar lag em listas grandes
  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (index >= maxAnimated) return child;
        return (
          <SlideInView delay={baseDelay + index * staggerDelay} duration={400}>
            {child}
          </SlideInView>
        );
      })}
    </>
  );
}

export function PulseView({ children, style, disabled = false }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    return () => animation.stop();
  }, [disabled]);

  if (disabled) return <View style={style}>{children}</View>;

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}

// View simples para evitar re-renders desnecessários
const View = ({ children, style }) => <Animated.View style={style}>{children}</Animated.View>;
