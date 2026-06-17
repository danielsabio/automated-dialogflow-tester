export function getSessionInfo(data: any) {
  const parameters = data.parameters.fields;
  return extractData(parameters);
}

const isRecursiveKind = (kind: any) => ["structValue"].includes(kind);

function extractData(parameters: any) {
  let sessionInfo: any = {};
  const keys = Object.keys(parameters);

  for (const key of keys) {
    const kind = parameters[key].kind;
    if (kind === "listValue") {
      sessionInfo[key] = parameters[key][kind]?.values.map((item: any) => {
        if (isRecursiveKind(item.kind)) {
          return extractData(item[item.kind].fields);
        }
        return item[item.kind];
      });
    } else if (isRecursiveKind(kind)) {
      sessionInfo[key] = extractData(parameters[key][kind].fields);
    } else {
      if (kind) {
        sessionInfo[key] = parameters[key][kind];
      }
    }
  }

  return sessionInfo;
}
