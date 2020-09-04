export default content => {
  const pasteboard = NSPasteboard.generalPasteboard();
  pasteboard.clearContents();
  pasteboard.setString_forType(content, NSPasteboardTypeString);
}
