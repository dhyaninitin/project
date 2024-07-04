 function checkAllSource(data) {
    let newArr;
    if (data.selectedSource.length > 0 && data.selectedSource[0] == 0) {
        data.selectedSource = [0]
        newArr = data.sources.map((el: any) => {
            if (el.id == 0) return el;
            else return { ...el, disabled: true }
        })
    } else {
        newArr = data.sources.map((el: any) => {
            return { ...el, disabled: false }
        })
    }
    data.sources = newArr;
    return data
}

function  formatDropdown(data){
    const all = { id: 0, first_name:"All", last_name:''};
    const sources = data.map(({ id, first_name, last_name, email }) => ({  id, first_name, last_name, email }));
    sources.sort((a, b) => a.first_name.localeCompare(b.first_name));
    return [all, ...sources]
  }

export {checkAllSource, formatDropdown}
