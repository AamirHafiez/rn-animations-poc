import Slider from "@/components/Slider/Slider";
import React from "react";
import { StyleSheet, View } from "react-native";

const SliderScreen = () => {
  return (
    <View style={styles.container}>
      <Slider
        min={0}
        max={1000}
        step={50}
        onEndDrag={(drag) => console.log("drag", drag)}
      />
    </View>
  );
};

export default SliderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
