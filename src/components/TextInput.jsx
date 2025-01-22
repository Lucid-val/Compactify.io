import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import mammoth from "mammoth";
import axios from "axios";

const TextInput = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isClearConfirmed, setIsClearConfirmed] = useState(false);
  const [summarizedText, setSummarizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const inputText = e.target.value;
    const words = inputText.trim().split(/\s+/).filter((word) => word.length > 0);
    if (words.length <= 1000) {
      setText(inputText);
      setWordCount(words.length);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(text);
    summarizeText(text);
  };

  const summarizeText = (text) => {
    const apiKey = "api_key"; // Replace with your Hugging Face API Key
    const modelURL = "https://api-inference.huggingface.co/models/google/pegasus-xsum"; // Updated to use Pegasus model

    setIsLoading(true); // Show loading while waiting for response

    axios
      .post(
        modelURL,
        {
          inputs: text,
          parameters: {
            min_length: 100, // Minimum length of output in tokens (approx words)
            max_length: 200, // Maximum length of output in tokens
            length_penalty: 1.5, // Encourage balanced but longer outputs
          },
          options: {
            use_cache: true, // Optimize API call performance
            wait_for_model: true, // Wait if the model is not already loaded
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      .then((response) => {
        console.log("API Response:", response); // Log the entire response for inspection
        
        // Check if the response contains a 'generated_text' field
        if (response.data && Array.isArray(response.data) && response.data[0]) {
          const summary = response.data[0].generated_text || response.data[0].summary_text;
          setSummarizedText(summary || "No summary could be generated.");
        } else {
          setSummarizedText("No summary could be generated.");
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error summarizing the text:", error);
        setSummarizedText("An error occurred while summarizing.");
        setIsLoading(false);
      });
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();

      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        reader.onload = () => {
          mammoth
            .extractRawText({ arrayBuffer: reader.result })
            .then((result) => {
              const extractedText = result.value.trim();
              setText(extractedText);
              setWordCount(extractedText.split(/\s+/).length);
            })
            .catch((err) => {
              console.error("Error extracting .docx content:", err);
            });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "text/plain") {
        reader.onload = () => {
          const plainText = reader.result.trim();
          setText(plainText);
          setWordCount(plainText.split(/\s+/).length);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const handleClearText = () => {
    if (isClearConfirmed) {
      setText("");
      setWordCount(0);
      setIsClearConfirmed(false); // Reset confirmation
    } else {
      setIsClearConfirmed(true);
    }
  };

  const handleCopyToClipboard = () => {
    if (summarizedText) {
      navigator.clipboard.writeText(summarizedText)
        .then(() => {
          alert("Summary copied to clipboard!");
        })
        .catch((error) => {
          console.error("Failed to copy text: ", error);
        });
    }
  };

  return (
    <div className="bg-[#030715] text-white font-sans">
      <div className="container mx-auto mt-10">
        <div className="w-full">
          <div
            {...getRootProps()}
            className="container mx-auto w-[50%] h-20 p-4 border-2 border-white rounded-lg flex justify-center items-center bg-[#030715] hover:bg-gray-800 cursor-pointer"
          >
            <input {...getInputProps()} />
            <span className="text-white text-xl">
              Drag and drop a .txt or .docx file here, or click to browse.
            </span>
          </div>

          <textarea
            className="w-full h-96 mt-10 text-gray-200 bg-[#030715] p-4 rounded-lg border border-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-black resize-none text-xl"
            placeholder="Enter your Text here to summarize..."
            value={text}
            onChange={handleInputChange}
          ></textarea>

          <div className="container flex justify-between items-center mt-5">
            <div>
              <button
                className="bg-[#030715] border border-white text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={wordCount === 0 || wordCount > 1000 || isLoading}
              >
                Summarize
              </button>
              <button
                className="bg-gray-300 text-black py-2 px-4 rounded-lg ml-4 hover:bg-gray-400"
                onClick={handleClearText}
              >
                {isClearConfirmed ? "Are you sure?" : "Clear"}
              </button>
            </div>
            <span className="text-lg">{wordCount}/1000</span>
          </div>

          {isLoading && (
            <div className="text-center text-md text-gray-600 mt-4">Summarizing... Please wait!</div>
          )}

          {summarizedText && !isLoading && (
            <div className="container mx-auto mt-8 w-full p-4 border-t border-gray-300">
              <h2 className="text-2xl font-extralight tracking-widest text-white mb-2 underline">
                AI Generated Summarized Text
              </h2>
              <p className="text-xl mt-10">{summarizedText}</p>
              <button
                onClick={handleCopyToClipboard}
                className="mt-4 bg-[#030715] border text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextInput;
