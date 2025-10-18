(async function () {
    for (let i = 100; i > 0; i--) {
        let node17 = editor.entities.root.findByName("Node_1")
        let newNode = await node17.duplicate();
        newNode.set("name", "Node_" + (19 + i))
        let child = newNode.findByName("Neighbor_2")
        child.set("name", "Neighbor_" + (19 + i - 1))
        let child2 = newNode.findByName("Neighbor_0")
        child2.set("name", "Neighbor_" + (19 + i + 1))


        let text = newNode.findByName("Text")
        let getComp = text.get("components")
        getComp.element.text = (19 + i);

        text.set("components", getComp)
    }
})();