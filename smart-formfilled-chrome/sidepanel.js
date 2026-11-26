const SCHEMA = [
  {
    title: "基本情報",
    sections: [
      {
        title: "氏名",
        fields: [
          ["basic.lastName", "姓"],
          ["basic.firstName", "名"],
          ["basic.fullName", "氏名"],
          ["basic.lastNameRoman", "ローマ字 姓"],
          ["basic.firstNameRoman", "ローマ字 名"],
          ["basic.fullNameRoman", "ローマ字 氏名"]
        ]
      },
      {
        title: "連絡先",
        fields: [
          ["basic.email", "メールアドレス"],
          ["phone.full", "携帯電話番号（全部）"],
          ["phone.part1", "携帯電話番号①"],
          ["phone.part2", "携帯電話番号②"],
          ["phone.part3", "携帯電話番号③"],
          ["phone.hyphen", "携帯電話番号（ハイフン付き）"],
          ["phone.international", "携帯電話番号（国際形式）"]
        ]
      },
      {
        title: "住所",
        fields: [
          ["address.postalCode", "郵便番号"],
          ["address.prefecture", "都道府県"],
          ["address.city", "市区町村"],
          ["address.street", "番地"],
          ["address.building", "建物名"],
          ["address.full", "住所（全文）"]
        ]
      }
    ]
  },
  {
    title: "学歴",
    sections: [
      {
        title: "小学校",
        fields: [
          ["education.elementary.name", "小学校名"],
          ["education.elementary.entry", "入学年月"],
          ["education.elementary.graduation", "卒業年月"]
        ]
      },
      {
        title: "中学校",
        fields: [
          ["education.juniorHigh.name", "中学校名"],
          ["education.juniorHigh.entry", "入学年月"],
          ["education.juniorHigh.graduation", "卒業年月"]
        ]
      },
      {
        title: "高等学校",
        fields: [
          ["education.highSchool.name", "高等学校名"],
          ["education.highSchool.entry", "入学年月"],
          ["education.highSchool.graduation", "卒業年月"]
        ]
      },
      {
        title: "大学",
        fields: [
          ["education.university.name", "大学名"],
          ["education.university.faculty", "学部名"],
          ["education.university.department", "学科名"],
          ["education.university.entry", "入学年月"],
          ["education.university.graduation", "卒業年月"]
        ]
      },
      {
        title: "大学院",
        fields: [
          ["education.graduate.name", "大学院名"],
          ["education.graduate.faculty", "研究科名"],
          ["education.graduate.department", "専攻・コース名"],
          ["education.graduate.entry", "入学年月"],
          ["education.graduate.graduation", "修了予定年月"],
          ["education.graduate.advisor", "指導教員氏名"],
          ["education.graduate.lab", "研究室またはゼミ名"]
        ]
      },
      {
        title: "その他",
        fields: [
          ["education.other", "その他学歴・活動"]
        ]
      }
    ]
  },
  {
    title: "語学・資格",
    sections: [
      {
        title: "英語",
        fields: [
          ["language.toeic", "TOEICスコア"],
          ["language.toefl", "TOEFLスコア"],
          ["language.ielts", "IELTSスコア"],
          ["language.englishLevel", "英語レベル"]
        ]
      },
      {
        title: "日本語・その他",
        fields: [
          ["language.jlpt", "JLPT"],
          ["language.other", "その他語学に関する資格等"]
        ]
      }
    ]
  },
  {
    title: "研究・経験",
    sections: [
      {
        title: "研究",
        fields: [
          ["research.theme", "研究テーマ"],
          ["research.summary", "研究概要"],
          ["research.thesis", "論文・卒論・修論テーマ"]
        ]
      },
      {
        title: "経験",
        fields: [
          ["experience.internship", "インターン経験"],
          ["experience.project", "プロジェクト経験"],
          ["experience.partTime", "アルバイト経験"],
          ["experience.other", "その他経験"]
        ]
      }
    ]
  },
  {
    title: "ESテンプレート",
    sections: [
      {
        title: "エントリーシート",
        fields: [
          ["templates.selfPr", "自己PR"],
          ["templates.motivation", "志望動機"],
          ["templates.gakuchika", "学生時代に力を入れたこと"],
          ["templates.research", "研究内容説明"]
        ]
      }
    ]
  }
];

let profile = {};

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;

  keys.slice(0, -1).forEach((key) => {
    if (!cur[key]) cur[key] = {};
    cur = cur[key];
  });

  cur[keys[keys.length - 1]] = value;
}

async function loadProfile() {
  const result = await chrome.storage.local.get("profile");
  profile = result.profile || {};

  migrateOldProfile();
  autoGenerateFields();

  renderInsertView();
  renderEditView();
}

function migrateOldProfile() {
  if (getByPath(profile, "contact.phone") && !getByPath(profile, "phone.full")) {
    const digits = String(getByPath(profile, "contact.phone")).replace(/\D/g, "");
    if (digits.length >= 10) {
      setByPath(profile, "phone.full", digits);
      setByPath(profile, "phone.part1", digits.slice(0, 3));
      setByPath(profile, "phone.part2", digits.slice(3, 7));
      setByPath(profile, "phone.part3", digits.slice(7));
    }
  }

  if (getByPath(profile, "language.toefl") === undefined && getByPath(profile, "language.toeflScore")) {
    setByPath(profile, "language.toefl", getByPath(profile, "language.toeflScore"));
  }
}

async function saveProfile() {
  document.querySelectorAll("[data-path]").forEach((el) => {
    setByPath(profile, el.dataset.path, el.value);
  });

  autoGenerateFields();

  await chrome.storage.local.set({ profile });

  renderInsertView();
  renderEditView();

  const btn = document.getElementById("saveBtn");
  btn.textContent = "保存済み";
  setTimeout(() => {
    btn.textContent = "保存";
  }, 1000);
}

function autoGenerateFields() {
  let full = getByPath(profile, "phone.full") || "";
  let part1 = getByPath(profile, "phone.part1") || "";
  let part2 = getByPath(profile, "phone.part2") || "";
  let part3 = getByPath(profile, "phone.part3") || "";

  if (full && (!part1 || !part2 || !part3)) {
    const digits = String(full).replace(/\D/g, "");
    if (digits.length >= 10) {
      part1 = digits.slice(0, 3);
      part2 = digits.slice(3, 7);
      part3 = digits.slice(7);
      setByPath(profile, "phone.part1", part1);
      setByPath(profile, "phone.part2", part2);
      setByPath(profile, "phone.part3", part3);
    }
  }

  if (part1 && part2 && part3) {
    setByPath(profile, "phone.full", `${part1}${part2}${part3}`);
    setByPath(profile, "phone.hyphen", `${part1}-${part2}-${part3}`);
    setByPath(profile, "phone.international", `+81-${part1.replace(/^0/, "")}-${part2}-${part3}`);
  }

  const pref = getByPath(profile, "address.prefecture") || "";
  const city = getByPath(profile, "address.city") || "";
  const street = getByPath(profile, "address.street") || "";
  const building = getByPath(profile, "address.building") || "";

  if (pref || city || street || building) {
    setByPath(profile, "address.full", `${pref}${city}${street}${building}`);
  }

  const lastName = getByPath(profile, "basic.lastName") || "";
  const firstName = getByPath(profile, "basic.firstName") || "";
  if ((lastName || firstName) && !getByPath(profile, "basic.fullName")) {
    setByPath(profile, "basic.fullName", `${lastName} ${firstName}`.trim());
  }

  const lastNameRoman = getByPath(profile, "basic.lastNameRoman") || "";
  const firstNameRoman = getByPath(profile, "basic.firstNameRoman") || "";
  if ((lastNameRoman || firstNameRoman) && !getByPath(profile, "basic.fullNameRoman")) {
    setByPath(profile, "basic.fullNameRoman", `${lastNameRoman} ${firstNameRoman}`.trim());
  }
}

async function insertToCurrentTab(value) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) {
    alert("現在のページを取得できません。");
    return;
  }

  const results = await chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
      allFrames: true
    },
    func: (insertValue) => {
      function isEditable(el) {
        if (!el) return false;

        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          const type = (el.type || "").toLowerCase();
          return !["hidden", "button", "submit", "reset", "file", "checkbox", "radio"].includes(type)
            && !el.disabled
            && !el.readOnly;
        }

        return el.isContentEditable;
      }

      const el = window.__JP_ES_CURRENT_FIELD__ || document.activeElement;

      if (!isEditable(el)) {
        return false;
      }

      el.focus();

      if (el.isContentEditable) {
        document.execCommand("insertText", false, insertValue);
      } else {
        const start = window.__JP_ES_CURSOR_START__ ?? el.value.length;
        const end = window.__JP_ES_CURSOR_END__ ?? el.value.length;

        el.value = el.value.slice(0, start) + insertValue + el.value.slice(end);

        const newPos = start + insertValue.length;
        el.setSelectionRange(newPos, newPos);

        window.__JP_ES_CURSOR_START__ = newPos;
        window.__JP_ES_CURSOR_END__ = newPos;
      }

      el.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: insertValue
      }));

      el.dispatchEvent(new Event("change", { bubbles: true }));

      return true;
    },
    args: [String(value)]
  });

  const success = results.some(r => r.result === true);

  if (!success) {
    alert("先に左側ページの入力欄をクリックしてください。");
  }
}

function createInsertButton(label, value) {
  const btn = document.createElement("button");
  btn.className = "item";

  btn.innerHTML = `
    <div class="item-label">${escapeHtml(label)}</div>
    <div class="item-value">${escapeHtml(value)}</div>
  `;

  btn.addEventListener("click", () => {
    insertToCurrentTab(value);
  });

  return btn;
}

function renderInsertView() {
  const root = document.getElementById("insertView");
  root.innerHTML = "";

  SCHEMA.forEach((group) => {
    const block = document.createElement("section");
    block.className = "block";

    const title = document.createElement("div");
    title.className = "block-title";
    title.textContent = group.title;
    block.appendChild(title);

    group.sections.forEach((section) => {
      const validFields = section.fields.filter(([path]) => {
        const value = getByPath(profile, path);
        return value !== undefined && value !== null && String(value).trim() !== "";
      });

      if (!validFields.length) return;

      const sub = document.createElement("div");
      sub.className = "sub-block";

      const subTitle = document.createElement("div");
      subTitle.className = "sub-title";
      subTitle.textContent = section.title;
      sub.appendChild(subTitle);

      validFields.forEach(([path, label]) => {
        const value = getByPath(profile, path);
        sub.appendChild(createInsertButton(label, value));
      });

      block.appendChild(sub);
    });

    if (block.children.length > 1) {
      root.appendChild(block);
    }
  });

  if (!root.innerHTML.trim()) {
    root.innerHTML = `<div class="empty">まだ資料が登録されていません。「資料編集」から入力してください。</div>`;
  }
}

function renderEditView() {
  const root = document.getElementById("editView");
  root.innerHTML = "";

  SCHEMA.forEach((group) => {
    const block = document.createElement("section");
    block.className = "block";

    const title = document.createElement("div");
    title.className = "block-title";
    title.textContent = group.title;
    block.appendChild(title);

    group.sections.forEach((section) => {
      const sub = document.createElement("div");
      sub.className = "sub-block";

      const subTitle = document.createElement("div");
      subTitle.className = "sub-title";
      subTitle.textContent = section.title;
      sub.appendChild(subTitle);

      section.fields.forEach(([path, label]) => {
        const labelEl = document.createElement("div");
        labelEl.className = "edit-label";
        labelEl.textContent = label;

        const isLong =
          path.includes("summary") ||
          path.includes("experience") ||
          path.includes("templates") ||
          path.includes("other") ||
          path.includes("research") ||
          path.includes("thesis");

        const input = document.createElement(isLong ? "textarea" : "input");
        input.dataset.path = path;
        input.placeholder = label;
        input.value = getByPath(profile, path) || "";

        sub.appendChild(labelEl);
        sub.appendChild(input);
      });

      block.appendChild(sub);
    });

    root.appendChild(block);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("saveBtn").addEventListener("click", saveProfile);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("active");
    });

    tab.classList.add("active");

    const target = tab.dataset.tab;

    document.getElementById("insertView").classList.toggle("hidden", target !== "insert");
    document.getElementById("editView").classList.toggle("hidden", target !== "edit");
  });
});

loadProfile();
