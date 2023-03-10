import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/src/Note";
import { Frequency } from "tone";

const saveFile = (filename: string, data: string) => {
  const blob = new Blob([data], { type: "text/plain" });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};

const convertMelody = (notes: Note[]) => {
  let code = `#define speed 1
const int notes[][3] = {`;
  notes.forEach((note) => {
    const freq = note.midi;
    const vel = Math.round(note.velocity * 126);
    const delay = Math.round(note.duration * 1000);
    code += `
  \{${freq}, ${vel}, ${delay}\},`;
  });
  code += "};\n";

  code += `
const int length = sizeof notes / sizeof(int[3]);
void noteOn(int cmd, int pitch, int velocity) {
  Serial.write(cmd);
  Serial.write(pitch);
  Serial.write(velocity);
}

bool state = 0;

void playMIDI(){
  for (int i = 0; i < length; i++) {
    noteOn(0x90, notes[i][0], notes[i][1]);
    delay(round(notes[i][2]*speed));
    noteOn(0x90, notes[i][0], 0);
    
    if (digitalRead(2) == 0) {
      state = !state;
      while (digitalRead(2) == 0);
      delay(200);
    }
    
    if (state == 1) {
      digitalWrite(LED_BUILTIN, LOW);
    } else {
      digitalWrite(LED_BUILTIN, HIGH);
    }
  }
}

void setup() {
  // put your setup code here, to run once:
  // call the song function with digital pin
  Serial.begin(31250);
  pinMode(2, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  playMIDI();
}
`;

  return code;
};

export { convertMelody, saveFile };
