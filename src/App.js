import React, { Component, Fragment } from "react"
import validator from 'validator'

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLoading:false,
            searchData: '',
            photos: [],
            next: 1
        }
        window.onscroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
                this.getPhotos();
            }
        };

    }

    componentDidMount() {
        this.getPhotos()
    }

    handleChange(e) {
        this.setState({
            searchData: e.target.value
        });
    }

    keyPress(e) {
        if(e.keyCode === 13) {
            this.setState({
                isLoading:false,
                searchData: e.target.value,
                photos: [],
                next: 1
            }, function(){
                this.getPhotos()
            })         
        }
    }

    getPhotos() {
        console.log(this.state)
        const API_KEY = "3a132b2bb78af8acd1d62ca9b0d7389f"
        let METHOD = "flickr.photos.search"

        if (validator.isEmpty(this.state.searchData)) 
            METHOD = "flickr.photos.getRecent"


        if(this.state.next !== null) {
            fetch(`https://api.flickr.com/services/rest/?page=${this.state.next}&method=${METHOD}&api_key=${API_KEY}&text=${this.state.searchData}&format=json&nojsoncallback=1`, {
                method: 'GET'
            })
            .then(res => {
                return res.json();
            })
            .then(data => {
                if(data.photos.photo.length > 0) {
                    let next = data.photos.page+1
                    if(data.photos.page === data.photos.pages) {
                        next = null 
                    }

                    const photos = data.photos.photo.map(photo => ({
                        id: photo.id,
                        owner: photo.owner,
                        secret: photo.secret,
                        server: photo.server,
                        farm: photo.farm,
                        title: photo.title,
                        url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
                    }));
                    
                    this.setState({
                        next: next,
                        photos: [
                            ...this.state.photos,
                            ...photos
                        ]
                    })
                }
            })
        }
    }

    render(){
        const {
            searchData,
            isLoading,
            photos,
            next,
        } = this.state;

        return(
            <>
                <input type="search" value={searchData} onKeyDown={this.keyPress.bind(this)} onChange={this.handleChange.bind(this)} placeholder="Search" />
                {photos.map(photo => (
                    <Fragment key={photo.id}>
                        <img src={photo.url} />
                    </Fragment>
                ))}
            </>
        )
    }
}

export default App;