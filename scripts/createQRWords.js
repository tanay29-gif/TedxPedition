import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const WORDS = [
  {
    qrId: "QR001",
    talkId: "TALK1",
    order: 1,
    word: "ideas",
    talkUrl: "https://www.ted.com/talks/1",
    timeStamp: Date.now()
  },
  {
    qrId: "QR002",
    talkId: "TALK2",
    order: 2,
    word: "worth",
    talkUrl: "https://www.ted.com/talks/2",
    timeStamp: Date.now()
  },
  {
    qrId: "QR003",
    talkId: "TALK3",
    order: 3,
    word: "spreading",
    talkUrl: "https://www.ted.com/talks/3",
    timeStamp: Date.now()
  },
  {
    qrId: "QR004",
    talkId: "TALK4",
    order: 4,
    word: "can",
    talkUrl: "https://www.ted.com/talks/4",
    timeStamp: Date.now()
  },
  {
    qrId: "QR005",
    talkId: "TALK5",
    order: 5,
    word: "change",
    talkUrl: "https://www.ted.com/talks/5",
    timeStamp: Date.now()
  },
  {
    qrId: "QR006",
    talkId: "TALK6",
    order: 6,
    word: "lives",
    talkUrl: "https://www.ted.com/talks/6",
    timeStamp: Date.now()
  }
];

const seedQRWords = async () => {
  console.log("========================");
  console.log("Creating QR Words");
  console.log("========================");

  try {
    const batch = writeBatch(db);

    for (const word of WORDS) {
      console.log(`Creating ${word.qrId}`);
      const wordRef = doc(db, "qr_words", word.qrId);
      batch.set(wordRef, word, { merge: true });
    }

    await batch.commit();

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Error creating QR words:", error);
    console.error("========================");
    process.exit(1);
  }
};

seedQRWords();
