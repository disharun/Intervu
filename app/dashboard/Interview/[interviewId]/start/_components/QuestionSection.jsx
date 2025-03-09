import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

function QuestionSection({ mockinterViewQuestions, activeQuestionIndex }) {
  const texttospeech = (text) => {
    if ("speechSynthesis" in window) {
      let speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Your browser doesn't support text to speech");
    }
  };
  return (
    mockinterViewQuestions && (
      <div className="p-5 border">
        <div className="flex flex-wrap gap-3 mb-5 justify-center">
          {mockinterViewQuestions.map((question, index) => (
            <div key={index}>
              <h2
                className={`p-2 bg-primary rounded-lg text-sm font-bold md:text-sm text-center cursor-pointer ${
                  activeQuestionIndex === index &&
                  "text-white bg-black shadow-lg "
                }`}
              >
                Question#{index + 1}:
              </h2>
              <div className="flex justify-between gap-5 mt-2">
                {activeQuestionIndex === index && (
                  <div className="p-3 border rounded-lg bg-gray-100 ">
                    <h2 className="p-2 text-xs md:text-sm font-bold text-center text-justify">
                      {mockinterViewQuestions[activeQuestionIndex]?.question}
                    </h2>
                    <Volume2
                      onClick={() => texttospeech(question.question)}
                      className="cursor-pointer mt-2 mb-10"
                    />
                    <div className="p-3 rounded-lg border bg-green-200">
                      <h2 className="flex items-center text-primary p-2 rounded-lg justify-center">
                        <Lightbulb />
                        <strong>Note:</strong>
                      </h2>
                      <h2 className=" flex gap-2 text-sm text-primary font-bold">
                        {process.env.NEXT_PUBLIC_QUESTION_NOTE}
                      </h2>
                    </div>
                    {/* 
                    <h2
                      className={`p-2 text-xs md:text-sm text-center text-justify cursor-pointer border rounded-lg mt-2 ${
                        activeQuestionIndex === index &&
                        "text-black bg-gray-200 shadow-lg "
                      }`}
                    >
                      <div className=" items-start flex gap-5">
                        <strong>{question.answer}</strong>
                      </div>
                    </h2> */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
}

export default QuestionSection;
