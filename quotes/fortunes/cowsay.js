function cowsay(text) {
  // A simplified string-width function for ASCII characters
  const stringWidth = (str) => {
    return str.length;
  };

  // Functions to create the speech balloon
  const top = (length) => {
    return new Array(length + 3).join("_");
  };

  const bottom = (length) => {
    return new Array(length + 3).join("-");
  };

  const pad = (text, length) => {
    return text + new Array(length - stringWidth(text) + 1).join(" ");
  };

  const split = (text, wrap) => {
    text = text
      .replace(/\r\n?|[\n\u2028\u2029]/g, "\n")
      .replace(/^\uFEFF/, "")
      .replace(/\t/g, "        ");
    const lines = [];
    if (!wrap) {
      return text.split("\n");
    }
    let start = 0;
    while (start < text.length) {
      const nextNewLine = text.indexOf("\n", start);
      const wrapAt = Math.min(
        start + wrap,
        nextNewLine === -1 ? text.length : nextNewLine,
      );
      lines.push(text.substring(start, wrapAt));
      start = wrapAt;
      if (text.charAt(start) === "\n") {
        start += 1;
      }
    }
    return lines;
  };

  const max = (lines) => {
    let max = 0;
    for (let i = 0, len = lines.length; i < len; i += 1) {
      if (stringWidth(lines[i]) > max) {
        max = stringWidth(lines[i]);
      }
    }
    return max;
  };

  const format = (text, wrap, delimiters) => {
    const lines = split(text, wrap);
    const maxLength = max(lines);
    let balloon;
    if (lines.length === 1) {
      balloon = [
        " " + top(maxLength),
        delimiters.only[0] + " " + lines[0] + " " + delimiters.only[1],
        " " + bottom(maxLength),
      ];
    } else {
      balloon = [" " + top(maxLength)];
      for (let i = 0, len = lines.length; i < len; i += 1) {
        let delimiter;
        if (i === 0) {
          delimiter = delimiters.first;
        } else if (i === len - 1) {
          delimiter = delimiters.last;
        } else {
          delimiter = delimiters.middle;
        }
        balloon.push(
          delimiter[0] + " " + pad(lines[i], maxLength) + " " + delimiter[1],
        );
      }
      balloon.push(" " + bottom(maxLength));
    }
    return balloon.join("\n");
  };

  const sayBalloon = (text, wrap) => {
    const delimiters = {
      first: ["/", "\\"],
      middle: ["|", "|"],
      last: ["\\", "/"],
      only: ["<", ">"],
    };
    return format(text, wrap, delimiters);
  };

  // Function to replace placeholders in the cow template
  const escapeRe = (s) => {
    if (s && s.replace) {
      return s.replace(/\$/g, "$$$$");
    }
    return s;
  };

  const replacer = (cow, variables) => {
    const eyes = escapeRe(variables.eyes);
    const eyeL = eyes.charAt(0);
    const eyeR = eyes.charAt(1);
    const tongue = escapeRe(variables.tongue);

    return cow
      .replace(/\$thoughts/g, variables.thoughts)
      .replace(/\$eyes/g, eyes)
      .replace(/\$tongue/g, tongue)
      .replace(/\$\{eyes\}/g, eyes)
      .replace(/\$eye/, eyeL)
      .replace(/\$eye/, eyeR)
      .replace(/\$\{tongue\}/g, tongue);
  };

  // The default cow ASCII art. Spaces here are crucial for alignment and are not replaced yet.
  const defaultCow = `
        $thoughts   ^__^
         $thoughts  ($eyes)\\_______
            (__)\\          )\\/\\
             $tongue   ||----w |
                  ||      ||`;

  // Default face options
  const face = {
    eyes: "oo",
    tongue: "  ",
    thoughts: "\\",
  };

  // Generate the balloon and the cow
  const balloon = sayBalloon(text, 40);
  const cow = replacer(defaultCow, face);

  // Format for HTML. This is where the space and newline replacement happens.
  let htmlOutput = (balloon + cow)
    .replace(/ /g, "&nbsp;")
    .replace(/\n/g, "<br>");

  // Return the final string
  return htmlOutput;
}
