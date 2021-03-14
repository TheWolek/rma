$(function () {
    //######################
    //##### /PANEL #########
    //######################
    if (window.location.pathname == "/panel" || window.location.pathname == "/panel/") {
        const tableHolder = $("#container")
        tableHolder.html(showTableHeader())
        fetchContent("")

        function showTableHeader() {
            let table = document.createElement("table")
            table.id = "content"
            let headers = document.createElement("thead")
            let tr = document.createElement("tr")
            let columns = ["nr zlecenia", "typ", "status", "status realizacji", "producent", "model", "SN"]

            columns.forEach(col => {
                let th = document.createElement("th")
                let txt = document.createTextNode(col)
                th.appendChild(txt)
                tr.appendChild(th)
            })

            headers.appendChild(tr)
            table.appendChild(headers)
            return table
        }

        function showContent(data) {
            let t = showTableHeader()
            data.forEach(item => {
                let row = document.createElement("tr")
                let id = item.id
                let tag = document.createElement("div")
                Object.keys(item).forEach(key => {
                    if (!["id","sprzedaz","fv","opis","status","priorytet"].includes(key)) {
                        let cell = document.createElement("td")
                        let txt = document.createTextNode(item[key])
                        cell.appendChild(txt)
                        if (key == "rma") {
                            tag.id = "tag" + id
                            tag.className = "tag"
                            cell.appendChild(tag)
                        }
                        row.appendChild(cell)
                    }

                    if (key == "status") {
                        let cell = document.createElement("td")
                        let txt 
                        switch (item[key]) {
                            case 1:
                                txt = document.createTextNode("Otwarte")
                                break
                        
                            case 2:
                                txt = document.createTextNode("Zakończone")
                                break
                        }
                        cell.appendChild(txt)
                        row.appendChild(cell)
                    }

                    if (key == "priorytet") {
                        let color
                        console.log(item[key])

                        switch (item[key]) {
                            case "ponowna reklamacja":
                                color = "cyan"
                                break;
                            case "szkoda transportowa":
                                color = "pink"
                                break;
                            case "decyzja":
                                color = "orange"
                                break;
                            case "naprawa płatna":
                                color = "lightblue"
                                break;
                            default:
                                color = "transparent"
                                break;
                        }
                        tag.style.background = color
                    }
                })

                row.id = id
                t.appendChild(row)
            })
            
            tableHolder.html(t)
        }

        function fetchContent(searchText) {
            fetch('http://localhost:3000/panel/find', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rma: searchText})
                }).then(res => res.json())
                .then(res => { console.log(res); showContent(res)});
        }

        $("#search").submit(function (e) {
            let rma = $("#rma").val()
            fetchContent(rma);
            return false;
        })

        $("#rma").change(function (e) {
            window.setTimeout(function () {
                fetchContent($("#rma").val());
            },800)
        })
    }

    //#######################
    // /PANEL/CREATE
    //########################
    if (window.location.pathname == "/panel/create" || window.location.pathname == "/panel/create/") {
        const typeSelect = $("#type")
        const prioSelect = $("#prio")

        fetch('http://localhost:3000/panel/create/gettypes', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
                }).then(res => res.json())
            .then(res => {
                res.forEach((item, key) => {
                    let option = document.createElement("option")
                    key = key + 1
                    let optionTxt = document.createTextNode(item[key])
                    option.value = key
                    option.appendChild(optionTxt)
                    typeSelect.append(option)
                });
            });
        
        fetch('http://localhost:3000/panel/create/getprio', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
                }).then(res => res.json())
            .then(res => {
                res.forEach((item, key) => {
                    let option = document.createElement("option")
                    key = key + 1
                    let optionTxt = document.createTextNode(item[key])
                    option.value = key
                    option.appendChild(optionTxt)
                    prioSelect.append(option)
                });
            });
    }
})