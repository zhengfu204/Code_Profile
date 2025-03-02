<template>
  <v-container class="d-flex justify-center align-center" fluid>
    <v-system-bar>
      <v-icon class="ms-2" icon="mdi-wifi-strength-4"></v-icon>

      <v-icon class="ms-2" icon="mdi-signal-cellular-outline"></v-icon>

      <v-icon class="ms-2" icon="mdi-battery"></v-icon>

      <span class="ms-2" style="color: lightgray;">{{ currentTime }}</span>
    </v-system-bar>

    <v-typography variant="h2" class="text-h3 font-weight-bold material-title"
      style="color: #ecf0f1 ; ">
      Code Profile
    </v-typography>

    <v-typography variant="h5" class="text-h6 font-weight-medium subtitle" style="color: gray; margin-top: 10px;" ref="typingText">
    </v-typography>

    <v-card class="mx-auto" prepend-icon="md:widgets" width="80vw" style="margin-top: 20px; justify-items: center;"
      subtitle="Press Enter to change lines">
      <template v-slot:title>
        <span class="font-weight-black">Your Code Here</span>
      </template>

      <v-textarea label=">" variant="outlined" style="width: 95%; height: 20vw;" @keyup="handleKeyup" v-model="code_input"></v-textarea>
    </v-card>
  </v-container>
</template>

<script>
import { onMounted, ref } from "vue";

export default {
  setup() {
    const currentTime = ref('');
    const typingText = ref(null);
    const subtitle = "Generate a typing-effect SVG animation and insert it into your Markdown file.";
    const code_input = ref('');
    let index = 0;

    const typeEffect = () => {
      if (index < subtitle.length) {
        typingText.value.textContent += subtitle.charAt(index);
        index++;
        setTimeout(typeEffect, 30);
      }
    };

    const updateTime = () => {
      const date = new Date();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      currentTime.value = `${hours}:${minutes}`;
    };

    const handleKeyup = (event) => {
      if (event.key === "Enter") {
        const lines = code_input.value.split('\n');
        if (lines.length > 1) {
          const previousLine = lines[lines.length - 2]; 
          console.log("上一行内容:", previousLine);
        }
      }
    };

    onMounted(() => {
      updateTime();
      setInterval(updateTime, 60000);
      typeEffect();
    });

    return {
      currentTime,
      typingText,
      code_input,
      handleKeyup,
    };
  },
};

</script>

<style>
.v-container {
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
