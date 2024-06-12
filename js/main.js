async function getWordData() {
  try {
    const response = await fetch("./js/leap.json");
    const data = await response.json();
    localStorage.setItem("wordData", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("単語データの取得に失敗しました:", error);
    return null; // エラーが発生した場合は null を返すなど、適切な処理を行う
  }
}

// 設定をローカルストレージに保存する関数
function saveSettings(
  startIndex,
  endIndex,
  headerOnly,
  timeLimit,
  questionType,
) {
  const settings = {
    startIndex: startIndex,
    endIndex: endIndex,
    headerOnly: headerOnly,
    timeLimit: timeLimit,
    questionType: questionType,
  };
  localStorage.setItem("settings", JSON.stringify(settings));
  localStorage.setItem("currentRound", "0");
  localStorage.removeItem("wordDataInRange");
}

// 設定を取得する関数
function getSettings() {
  const storedSettings = localStorage.getItem("settings");
  // ローカルストレージに設定が保存されていればそれを返し、そうでなければデフォルト値を返す
  return storedSettings
    ? JSON.parse(storedSettings)
    : {
        startIndex: 1,
        endIndex: 1935,
        headerOnly: false,
        timeLimit: false,
        questionType: true,
      };
}

// 自分の単語帳を取得する関数
function getWordbook() {
  const storedSettings = localStorage.getItem("wordbook");
  // ローカルストレージに設定が保存されていればそれを返し、そうでなければデフォルト値を返す
  return storedSettings ? JSON.parse(storedSettings) : [];
}

// 設定をローカルストレージに保存する関数
function saveLEAPIndex(startIndex, endIndex) {
  const settings = {
    startIndex: startIndex,
    endIndex: endIndex,
  };
  localStorage.setItem("LEAPIndex", JSON.stringify(settings));
}

// 自分の単語帳を取得する関数
function getLEAPIndex() {
  const storedSettings = localStorage.getItem("LEAPIndex");
  // ローカルストレージに設定が保存されていればそれを返し、そうでなければデフォルト値を返す
  return storedSettings
    ? JSON.parse(storedSettings)
    : {
        startIndex: 1,
        endIndex: 1935,
      };
}

document.getElementById("home").addEventListener("click", function () {
  window.location.reload();
});

let opened = false;
document.getElementById("wordbook").addEventListener("click", function () {
  if (!isPlayed) {
    const wordDataPromise = getWordData(); // 単語データを取得

    wordDataPromise.then((wordData) => {
      const questionContainer = document.querySelector(".contents");
      const WordBookContainer = document.querySelector(".wordbooks");
      const settingsContainer = document.querySelector(".settings");
      const leapContainer = document.querySelector(".leap");
      settingsContainer.style.display = "none";
      questionContainer.style.display = "none";
      WordBookContainer.style.display = "block";
      leapContainer.style.display = "none";

      const wordbook = getWordbook();

      const registeredWordsContainer =
        document.querySelector(".registered_words");
      if (!opened) {
        opened = true;
        wordbook.forEach((word) => {
          const questionDiv = document.createElement("div");
          const wordDiv = document.createElement("div");
          const meaningsDiv = document.createElement("div");
          const registerButton = document.createElement("button");
          const isRegistered = wordbook.some((w) => w.id === word.id);

          questionDiv.classList.add("word_container");
          wordDiv.classList.add("word");
          meaningsDiv.classList.add("meanings");

          wordDiv.textContent = word.word;
          meaningsDiv.textContent = word.definitions.join(", ");
          questionDiv.appendChild(wordDiv);
          questionDiv.appendChild(meaningsDiv);

          registerButton.classList.add("submit");
          registerButton.classList.add("register");
          registerButton.dataset.id = word.id;
          registerButton.style.backgroundColor = isRegistered
            ? "#b72d32"
            : "#309b61";
          registerButton.textContent = isRegistered
            ? "登録済み"
            : "単語帳に登録";
          questionDiv.appendChild(registerButton);

          registeredWordsContainer.append(questionDiv);
        });
      }

      document
        .querySelector("#wordbook_play")
        .addEventListener("click", function () {
          localStorage.setItem("wordDataInRange", JSON.stringify(wordbook));
          alert("単語帳から出題するようにしました！");
        });

      let register = document.querySelectorAll(".register");
      for (let i = 0; i < register.length; i++) {
        register[i].addEventListener(
          "click",
          function () {
            let id = register[i].dataset.id;
            const word = wordData[id - 1];
            const isRegistered = wordbook.some((w) => w.id === id);
            const index = wordbook.findIndex((w) => w.id === id);

            if (!isRegistered) {
              wordbook.push(word);
              register[i].style.backgroundColor = "#b72d32";
              register[i].textContent = "登録済み";
            } else {
              wordbook.splice(index, 1);
              register[i].style.backgroundColor = "#309b61";
              register[i].textContent = "単語帳に登録";
            }

            console.log(wordbook);
            localStorage.setItem("wordbook", JSON.stringify(wordbook));
          },
          false,
        );
      }
    });
  } else {
    alert("プレイ中は単語帳は開けません。");
  }
});

document.querySelector("#leap").addEventListener("click", function () {
  const wordDataPromise = getWordData(); // 単語データを取得

  wordDataPromise.then((wordData) => {
    const questionContainer = document.querySelector(".contents");
    const WordBookContainer = document.querySelector(".wordbooks");
    const settingsContainer = document.querySelector(".settings");
    const leapContainer = document.querySelector(".leap");
    settingsContainer.style.display = "none";
    questionContainer.style.display = "none";
    WordBookContainer.style.display = "none";
    leapContainer.style.display = "block";

    const wordbook = getWordbook();

    const leap = getLEAPIndex();
    const startIndex = leap.startIndex;
    const endIndex = leap.endIndex;

    wordDataInRange = wordData.filter(
      (word) =>
        parseInt(word.id) >= parseInt(startIndex) &&
        parseInt(word.id) <= parseInt(endIndex),
    );

    let Index = 0;
    function displayWord(Index) {
      if (Index == -1) {
        Index = wordDataInRange.length - 1;
      } else if (Index == wordDataInRange.length) {
        Index = 0;
      }

      const leapContainer = document.querySelector(".leap"); // leapContainerを取得

      // leapContainer内の要素を更新する
      leapContainer.innerHTML = `
                    <div class="question">- LEAP: ${wordDataInRange[Index].id} 番 -</div>
                    <div class="question_word">${wordDataInRange[Index].word}</div>
                    <div class="means_container">
                        <div class="turn"><button class="forward"></button></div>
                        <div class="means">
                            <p class="bold">意味</p>
                            <button class="meaning closed">${wordDataInRange[Index].definitions.join(", ")}</button>
                            <button class="submit register" data-id="${wordDataInRange[Index].id}" style="background-color: ${wordbook.some((w) => w.id === wordDataInRange[Index].id) ? "#b72d32" : "#309b61"}">${wordbook.some((w) => w.id === wordDataInRange[Index].id) ? "登録済み" : "単語帳に登録"}</button>
                        </div>
                        <div class="turn"><button class="next"></button></div>
                    </div>
                `;

      // イベントリスナーを設定する
      const nextButton = leapContainer.querySelector(".next");
      const forwardButton = leapContainer.querySelector(".forward");
      nextButton.addEventListener("click", () => displayWord(Index + 1));
      forwardButton.addEventListener("click", () => displayWord(Index - 1));
      document.querySelector(".meaning").addEventListener("click", function () {
        document.querySelector(".meaning").classList.remove("closed");
      });
      let register = document.querySelectorAll(".register");
      for (let i = 0; i < register.length; i++) {
        register[i].addEventListener(
          "click",
          function () {
            let id = register[i].dataset.id;
            const word = wordData[id - 1];
            const isRegistered = wordbook.some((w) => w.id === id);
            const index = wordbook.findIndex((w) => w.id === id);

            if (!isRegistered) {
              wordbook.push(word);
              register[i].style.backgroundColor = "#b72d32";
              register[i].textContent = "登録済み";
            } else {
              wordbook.splice(index, 1);
              register[i].style.backgroundColor = "#309b61";
              register[i].textContent = "単語帳に登録";
            }

            localStorage.setItem("wordbook", JSON.stringify(wordbook));
          },
          false,
        );
      }
    }

    displayWord(Index);
  });
});

let isPlayed = false;

document.getElementById("settings").addEventListener("click", function () {
  if (!isPlayed) {
    const questionContainer = document.querySelector(".contents");
    const WordBookContainer = document.querySelector(".wordbooks");
    const settingsContainer = document.querySelector(".settings");
    const leapContainer = document.querySelector(".leap");
    settingsContainer.style.display = "block";
    questionContainer.style.display = "none";
    WordBookContainer.style.display = "none";
    leapContainer.style.display = "none";

    const settings = getSettings(); // 設定を取得
    const leap = getLEAPIndex();

    const startIndex = document.querySelector("#first");
    const endIndex = document.querySelector("#last");

    const leapStartIndex = document.querySelector("#leap_first");
    const leapLastIndex = document.querySelector("#leap_last");

    const questionType = document.querySelector("#playMode");
    const timeLimit = document.querySelector("#timeLimit");
    const headerOnly = document.querySelector("#headerOnly");

    startIndex.value = settings.startIndex;
    endIndex.value = settings.endIndex;
    leapStartIndex.value = leap.startIndex;
    leapLastIndex.value = leap.endIndex;
    questionType.checked = settings.questionType;
    headerOnly.checked = settings.headerOnly;
    timeLimit.checked = settings.timeLimit;
  } else {
    alert("プレイ中は設定画面は開けません。");
  }
});

document.getElementById("confirm").addEventListener("click", function () {
  const startIndex = document.querySelector("#first").value;
  const endIndex = document.querySelector("#last").value;
  const questionType = document.querySelector("#playMode").checked;
  const timeLimit = document.querySelector("#timeLimit").checked;
  const headerOnly = document.querySelector("#headerOnly").checked;

  const leapStartIndex = document.querySelector("#leap_first").value;
  const leapLastIndex = document.querySelector("#leap_last").value;

  if (
    parseInt(startIndex) <= 1935 &&
    parseInt(endIndex) <= 1935 &&
    parseInt(endIndex) > parseInt(startIndex)
  ) {
    if (
      parseInt(leapStartIndex) <= 1935 &&
      parseInt(leapLastIndex) <= 1935 &&
      parseInt(leapLastIndex) > parseInt(leapStartIndex)
    ) {
      saveSettings(startIndex, endIndex, headerOnly, timeLimit, questionType);
      saveLEAPIndex(parseInt(leapStartIndex), parseInt(leapLastIndex));
      alert("更新しました！");
    } else {
      alert("デジタル単語帳の範囲の入力値が不正です。");
    }
  } else {
    alert("チャレンジする単語範囲の入力値が不正です。");
  }
});

document.getElementById("play").addEventListener("click", function () {
  const settings = getSettings(); // 設定を取得
  const startIndex = settings.startIndex;
  const endIndex = settings.endIndex;
  const playMode = settings.questionType;
  const headerOnly = settings.headerOnly;
  const timeLimit = settings.timeLimit;

  isPlayed = true;

  const wordDataPromise = getWordData(); // 単語データを取得

  wordDataPromise.then((wordData) => {
    const questionContainer = document.querySelector(".contents");
    questionContainer.innerHTML = ""; // コンテンツをリセット

    let currentQuestionIndex = 0;
    let correctAnswers = 0;

    let wordDataInRange = localStorage.getItem("wordDataInRange");
    if (wordDataInRange) {
      wordDataInRange = JSON.parse(wordDataInRange); // 文字列を配列に変換
    } else {
      // wordData 配列の指定された範囲の要素を抽出する
      wordDataInRange = wordData.filter(
        (word) =>
          parseInt(word.id) >= parseInt(startIndex) &&
          parseInt(word.id) <= parseInt(endIndex),
      );
    }

    // 範囲内の問題数が10問未満の場合は、全ての問題を使うようにする
    const totalQuestions = Math.min(10, wordDataInRange.length);

    const selectedQuestions = [];
    // 問題を生成する関数
    function nextQuestion() {
      questionContainer.innerHTML = ""; // コンテンツをリセット
      const wordbook = getWordbook();

      // 全ての問題を解いた場合
      if (currentQuestionIndex === totalQuestions) {
        isPlayed = false;
        let times = Math.ceil(wordDataInRange.length / 10);
        let resultMessage = `正解数は ${correctAnswers} / ${totalQuestions} です。`;

        const currentRound =
          parseInt(localStorage.getItem("currentRound") || "0") + 1;

        const timesDiv = document.createElement("div");
        timesDiv.classList.add("clear");
        timesDiv.textContent = `- あと${times}プレイで、${currentRound}周目です！ -`;

        // wordDataInRangeがすべて解かれた場合のみ表示
        if (wordDataInRange.length === 0) {
          // 全ての問題が解かれたことを示すために currentRound を更新
          localStorage.setItem("currentRound", currentRound.toString());

          timesDiv.textContent = `- ${currentRound}回目の周回を終えました！ -`;

          wordDataInRange = wordData.filter(
            (word) =>
              parseInt(word.id) >= parseInt(startIndex) &&
              parseInt(word.id) <= parseInt(endIndex),
          );
          localStorage.setItem(
            "wordDataInRange",
            JSON.stringify(wordDataInRange),
          ); // 配列を文字列に変換して保存
        }

        const resultDiv = document.createElement("div");
        resultDiv.classList.add("clear");
        resultDiv.textContent = resultMessage;

        questionContainer.appendChild(resultDiv);
        questionContainer.appendChild(timesDiv);

        selectedQuestions.forEach((word) => {
          const questionDiv = document.createElement("div");
          const wordDiv = document.createElement("div");
          const meaningsDiv = document.createElement("div");
          const registerButton = document.createElement("button");
          const isRegistered = wordbook.some((w) => w.id === word.id);

          questionDiv.classList.add("word_container");
          wordDiv.classList.add("word");
          meaningsDiv.classList.add("meanings");

          wordDiv.textContent = word.word;
          meaningsDiv.textContent = word.definitions.join(", ");
          questionDiv.appendChild(wordDiv);
          questionDiv.appendChild(meaningsDiv);

          registerButton.classList.add("submit");
          registerButton.classList.add("register");
          registerButton.dataset.id = word.id;
          registerButton.style.backgroundColor = isRegistered
            ? "#b72d32"
            : "#309b61";
          registerButton.textContent = isRegistered
            ? "登録済み"
            : "単語帳に登録";
          questionDiv.appendChild(registerButton);

          questionContainer.appendChild(questionDiv);
        });

        const playButton = document.createElement("button");
        playButton.classList.add("submit");
        playButton.id = "play";
        playButton.textContent = "再チャレンジ";
        questionContainer.appendChild(playButton);

        playButton.addEventListener("click", function () {
          correctAnswers = 0; // 正解数をリセット
          currentQuestionIndex = 0; // 現在の問題インデックスをリセット
          selectedQuestions.length = 0;
          nextQuestion(); // 新しい問題を生成
        });

        let register = document.querySelectorAll(".register");
        for (let i = 0; i < register.length; i++) {
          register[i].addEventListener(
            "click",
            function () {
              let id = register[i].dataset.id;
              const word = wordData[id - 1];
              const isRegistered = wordbook.some((w) => w.id === id);
              const index = wordbook.findIndex((w) => w.id === id);

              if (!isRegistered) {
                wordbook.push(word);
                register[i].style.backgroundColor = "#b72d32";
                register[i].textContent = "登録済み";
              } else {
                wordbook.splice(index, 1);
                register[i].style.backgroundColor = "#309b61";
                register[i].textContent = "単語帳に登録";
              }

              console.log(wordbook);
              localStorage.setItem("wordbook", JSON.stringify(wordbook));
            },
            false,
          );
        }

        return; // 処理を終了
      }

      // 現在の問題を取得
      const currentQuestion = getRandomQuestion(); // ランダムな問題を取得

      let questionWord = currentQuestion.word;
      let correctMeaning =
        currentQuestion.definitions[
          Math.floor(Math.random() * currentQuestion.definitions.length)
        ];

      if (headerOnly) {
        correctMeaning = currentQuestion.definitions[0];
      }

      if (!playMode) {
        questionWord =
          currentQuestion.definitions[
            Math.floor(Math.random() * currentQuestion.definitions.length)
          ];
        correctMeaning = currentQuestion.word;
      }

      const questionDiv = document.createElement("div");
      const question_wordDiv = document.createElement("div");
      const choiceContainerDiv = document.createElement("div");

      questionDiv.classList.add("question");
      question_wordDiv.classList.add("question_word");

      if (!playMode) {
        question_wordDiv.classList.add("ja");
      }

      questionDiv.textContent = `問題 ${currentQuestionIndex + 1} (LEAP:${currentQuestion.id}番)`; // 問題文を表示
      question_wordDiv.textContent = `${questionWord}`;

      questionContainer.appendChild(questionDiv);
      questionContainer.appendChild(question_wordDiv);

      if (timeLimit) {
        const timeLimitDiv = document.createElement("div");
        const timeLimitSpan = document.createElement("span");
        timeLimitDiv.classList.add("prog-bar");
        timeLimitDiv.appendChild(timeLimitSpan);
        questionContainer.appendChild(timeLimitDiv);
        timer = setTimeout(function () {
          // 正解かどうかに応じてメッセージを表示
          const resultMessage = `不正解... <br> 正解： ${correctMeaning}`;
          const resultDiv = document.createElement("div");
          resultDiv.classList.add("result");
          resultDiv.innerHTML = resultMessage;
          questionContainer.prepend(resultDiv);
          resultDiv.style.backgroundColor = "salmon";

          const isRegistered = wordbook.some(
            (w) => w.id === currentQuestion.id,
          );
          if (!isRegistered) {
            wordbook.push(currentQuestion);
            localStorage.setItem("wordbook", JSON.stringify(wordbook));
          }

          choiceContainerDiv.remove(); // 現在の問題を削除
          setTimeout(function () {
            resultDiv.remove();
            currentQuestionIndex++; // 次の問題へ進む
            nextQuestion(); // 次の問題を生成
          }, 1000);
        }, 10000);
      }

      questionContainer.appendChild(choiceContainerDiv);

      // 不正解の意味を含む選択肢を生成
      const incorrectMeanings = [];
      while (incorrectMeanings.length < 3) {
        const randomIndex = Math.floor(Math.random() * wordData.length);
        const randomWord = wordData[randomIndex];
        let randomMeaning =
          randomWord.definitions[
            Math.floor(Math.random() * randomWord.definitions.length)
          ];

        if (!playMode) {
          randomMeaning = randomWord.word;
        }

        if (
          !incorrectMeanings.includes(randomMeaning) &&
          randomMeaning !== correctMeaning
        ) {
          incorrectMeanings.push(randomMeaning);
        }
      }

      // 正解と不正解の意味を結合して選択肢を作成
      const choices = [correctMeaning, ...incorrectMeanings].sort(
        () => 0.5 - Math.random(),
      );

      // 選択肢を表示
      choices.forEach((choice) => {
        const choiceButton = document.createElement("button");
        choiceContainerDiv.classList.add("choice_container");
        choiceButton.classList.add("choice");
        choiceButton.textContent = choice;
        choiceContainerDiv.appendChild(choiceButton);

        // 選択肢がクリックされたときの処理
        choiceButton.addEventListener("click", function () {
          if (timeLimit) {
            clearInterval(timer);
          }
          choiceContainerDiv.remove(); // 現在の問題を削除
          // 選択肢が正解かどうかを判定
          const isCorrect = choice === correctMeaning;

          if (isCorrect) {
            correctAnswers++; // 正解の場合、正解数を増やす
          } else {
            const isRegistered = wordbook.some(
              (w) => w.id === currentQuestion.id,
            );
            if (!isRegistered) {
              wordbook.push(currentQuestion);
              localStorage.setItem("wordbook", JSON.stringify(wordbook));
            }
          }

          // 正解かどうかに応じてメッセージを表示
          const resultMessage = isCorrect
            ? "正解！"
            : `不正解... <br> 正解： ${correctMeaning}`;
          const resultDiv = document.createElement("div");
          resultDiv.classList.add("result");
          resultDiv.innerHTML = resultMessage;
          questionContainer.prepend(resultDiv);

          // 正解を示すために背景色を変更
          if (isCorrect) {
            resultDiv.style.backgroundColor = "lightgreen";
          } else {
            resultDiv.style.backgroundColor = "salmon";
          }

          // 一定時間後に正解・不正解のメッセージを消去
          setTimeout(function () {
            resultDiv.remove();
            currentQuestionIndex++; // 次の問題へ進む
            nextQuestion(); // 次の問題を生成
          }, 1000);
        });
      });
    }

    // 最初の問題を生成
    nextQuestion();

    console.log(wordDataInRange);
    console.log(endIndex);

    // ランダムな問題を取得する関数
    function getRandomQuestion() {
      // ランダムなインデックスを生成
      const randomIndex = Math.floor(Math.random() * wordDataInRange.length);
      // ランダムなインデックスに対応する問題を取得して返す
      const randomQuestion = wordDataInRange[randomIndex];
      selectedQuestions.push(randomQuestion);
      // 取得した問題を配列から削除
      wordDataInRange.splice(randomIndex, 1);
      // 更新されたwordDataInRangeを再度ローカルストレージに保存
      localStorage.setItem("wordDataInRange", JSON.stringify(wordDataInRange)); // 配列を文字列に変換して保存
      return randomQuestion;
    }

    window.addEventListener("beforeunload", function (event) {
      const message = "問題を解いている途中なら再読み込みは非推奨です。";
      event.preventDefault();
      event.returnValue = message;
      return message;
    });
  });
});

// 配列をシャッフルする関数
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
