// /src/components/Animations.js
// Expands: AnimatedComponents.js with FadeIn, SlideUp, ScalePress, Skeleton, StaggerList

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// FADE IN
// ═══════════════════════════════════════════════════════════

export const FadeIn = ({
  children,
  duration = 400,
  delay = 0,
  style,
  onAnimationEnd,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });

    anim.start(() => onAnimationEnd?.());
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// SLIDE UP
// ═══════════════════════════════════════════════════════════

export const SlideUp = ({
  children,
  duration = 400,
  delay = 0,
  distance = 30,
  style,
  onAnimationEnd,
}) => {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.6,
        delay,
        useNativeDriver: true,
      }),
    ]);

    anim.start(() => onAnimationEnd?.());
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { transform: [{ translateY }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// SLIDE IN (horizontal)
// ═══════════════════════════════════════════════════════════

export const SlideIn = ({
  children,
  direction = 'right', // 'right' | 'left'
  duration = 350,
  delay = 0,
  distance = 50,
  style,
}) => {
  const translateX = useRef(
    new Animated.Value(direction === 'right' ? distance : -distance)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        { transform: [{ translateX }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// SCALE PRESS
// ═══════════════════════════════════════════════════════════

export const ScalePress = ({
  children,
  onPress,
  scale = 0.95,
  style,
  disabled = false,
  activeOpacity = 0.9,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// STAGGER LIST
// ═══════════════════════════════════════════════════════════

export const StaggerList = ({
  children,
  staggerDelay = 80,
  initialDelay = 0,
  animationType = 'slideUp', // 'slideUp' | 'fadeIn' | 'slideRight'
  style,
}) => {
  const animatedValues = useRef(
    React.Children.map(children, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
      translateX: new Animated.Value(animationType === 'slideRight' ? 30 : 0),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((val, index) =>
      Animated.parallel([
        Animated.timing(val.opacity, {
          toValue: 1,
          duration: 300,
          delay: initialDelay + index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.timing(val.translateY, {
          toValue: 0,
          duration: 350,
          delay: initialDelay + index * staggerDelay,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(val.translateX, {
          toValue: 0,
          duration: 350,
          delay: initialDelay + index * staggerDelay,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, []);

  return (
    <View style={style}>
      {React.Children.map(children, (child, index) => (
        <Animated.View
          key={index}
          style={{
            opacity: animatedValues[index].opacity,
            transform: [
              { translateY: animatedValues[index].translateY },
              { translateX: animatedValues[index].translateX },
            ],
          }}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// SKELETON LOADING
// ═══════════════════════════════════════════════════════════

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: SCREEN_WIDTH,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const shimmerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)';
  const baseColor = isDark ? '#2C2C2E' : '#E5E5EA';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '40%',
          height: '100%',
          backgroundColor: shimmerColor,
          transform: [{ translateX: shimmerAnim }],
        }}
      />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// SKELETON CARD
// ═══════════════════════════════════════════════════════════

export const SkeletonCard = ({ style }) => {
  return (
    <View style={[{ padding: 16, gap: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={16} borderRadius={6} />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
      </View>
      <Skeleton width="100%" height={8} borderRadius={4} />
      <Skeleton width="60%" height={8} borderRadius={4} />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// PULSE
// ═══════════════════════════════════════════════════════════

export const Pulse = ({
  children,
  duration = 2000,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// BOUNCE IN
// ═══════════════════════════════════════════════════════════

export const BounceIn = ({
  children,
  duration = 600,
  delay = 0,
  style,
}) => {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.4,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// COUNT UP NUMBER
// ═══════════════════════════════════════════════════════════

export const CountUp = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const anim = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Number(v.toFixed(decimals)));
    });

    anim.start();
    return () => {
      anim.stop();
      animatedValue.removeListener(listener);
    };
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toLocaleString('pt-BR')}{suffix}
    </Text>
  );
};

// ═══════════════════════════════════════════════════════════
// ROTATE
// ═══════════════════════════════════════════════════════════

export const Rotate = ({
  children,
  duration = 2000,
  style,
}) => {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[{ transform: [{ rotate: spin }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  FadeIn,
  SlideUp,
  SlideIn,
  ScalePress,
  StaggerList,
  Skeleton,
  SkeletonCard,
  Pulse,
  BounceIn,
  CountUp,
  Rotate,
};