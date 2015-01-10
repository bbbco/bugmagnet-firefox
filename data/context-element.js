// context element handler populates the control with its data
self.on("click", function(node, data) {
    if (node.tagName === "TEXTAREA" || node.tagName === "INPUT") {
        node.value = data;
    } else if (node.hasAttribute("contenteditable")) {
        node.innerText = data;
    }
});
