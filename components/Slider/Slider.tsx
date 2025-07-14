import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type SliderProps = {
  min: number;
  max: number;
  step: number;
  initialPos?: number;
  onEndDrag?: (data: number) => void;
};

const Slider = (props: SliderProps) => {
  const { min, max, step, initialPos = 0, onEndDrag } = props;
  const { width: windowWidth } = useWindowDimensions();

  const sliderStartPosOffset = windowWidth / 2 - 2;
  const positionRef = useRef(initialPos);

  const barArray = Array.from(
    { length: (max - min) / step },
    (_, index) => index,
  );

  const minBarArray = Array.from({ length: 4 }, (_, index) => index);

  const mainBarWidth = 1;
  const miniBarWidth = 1;
  const spacing = 10; // marginRight or gap in px

  const totalMainBars = barArray.length;
  const totalMiniBars = minBarArray.length * (barArray.length - 1);

  const totalWidth =
    totalMainBars * (mainBarWidth + spacing) +
    totalMiniBars * (miniBarWidth + spacing);

  const stepWidth = totalWidth / (barArray.length - 1);

  const sliderOffset = useSharedValue(0);

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getCurrentBar = () => {
    "worklet";
    const bar = Math.round(-1 * (sliderOffset.value / stepWidth));
    if (bar < 0) return 0;
    if (bar > totalMainBars) return totalMainBars;
    return bar;
  };

  const onEndSliderDrag = (bar: number) => {
    onEndDrag?.(bar);
  };

  const sliderPanGesture = Gesture.Pan()
    .onChange((event) => {
      sliderOffset.value += event.changeX;
      const currentBar = getCurrentBar();
      if (positionRef.current !== currentBar) {
        runOnJS(vibrate)();
        positionRef.current = currentBar;
      }
    })
    .onFinalize((event) => {
      // Left out of bound handled
      if (-1 * sliderOffset.value < 0) {
        sliderOffset.value = withSpring(0);
      }
      // Right out of bound handled
      else if (-1 * sliderOffset.value >= totalWidth) {
        sliderOffset.value = withSpring(-1 * (totalWidth - 2));
      }
      // handling when slider is in between the range - with snap
      else {
        const currentBar = getCurrentBar();
        const translateXForCurrentBar = currentBar * stepWidth; // snapping slider to nearest rounded off distance
        sliderOffset.value = withSpring(-1 * (translateXForCurrentBar - 2));
      }
    })
    .onTouchesUp(() => {
      const currentBar = getCurrentBar();
      runOnJS(onEndSliderDrag)(currentBar);
    });

  const sliderAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderOffset.value + sliderStartPosOffset }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.barIndicator, { left: windowWidth / 2 - 2 }]} />
      <GestureDetector gesture={sliderPanGesture}>
        <Animated.View
          style={[
            styles.barContainer,
            { width: totalWidth },
            sliderAnimatedStyles,
          ]}
        >
          {barArray.map((bar, index) => {
            return (
              <React.Fragment key={bar.toString()}>
                <View style={styles.mainBar} />
                {index !== barArray.length - 1 &&
                  minBarArray.map((miniBar) => {
                    return (
                      <View
                        style={styles.miniBar}
                        key={`miniBar-${bar}-${miniBar}`}
                      />
                    );
                  })}
              </React.Fragment>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default Slider;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  barIndicator: {
    width: 4,
    height: 36,
    backgroundColor: "navy",
    position: "absolute",
    top: 32,
    borderRadius: 12,
    zIndex: 1,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  mainBar: {
    width: 1,
    height: 20,
    backgroundColor: "darkgreen",
  },
  miniBar: {
    width: 1,
    height: 6,
    backgroundColor: "cornflowerblue",
  },
});
