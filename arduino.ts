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
  let code = `
#define speed 1
void playMIDI(){
  `;
  notes.forEach((note) => {
    const freq = note.midi;
    const vel = note.velocity;
    code += `
  noteOn(0x90, ${freq}, ${vel});
  delay(round(${Math.round(note.duration * 1000)}*speed));
  noteOn(0x90, ${freq}, 0x00);
`;
  });
  code += "}\n";

  code += `
void noteOn(int cmd, int pitch, int velocity) {
  Serial.write(cmd);
  Serial.write(pitch);
  Serial.write(velocity);
}
  
void setup() {
  // put your setup code here, to run once:
  // call the song function with digital pin
  Serial.begin(31250);
}

void loop() {
  // put your main code here, to run repeatedly:
  playMIDI();
}
`;

  return code;
};

export { convertMelody, saveFile };
