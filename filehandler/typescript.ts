type WindowStates = "open" | "closed" | "minimized";
function getLength(obj: WindowStates | WindowStates[]) {
  return obj.length;
}
