import React, { Component } from "react"
import validator from 'validator'
import Lottie from 'react-lottie'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            suggestion: [],
            searchData: '',
            photos: [],
            next: 1,
            isEmpty: false,
            modal: {
                image: null,
                title: null,
                display: 'none'
            }
        }

        //onScroll function to retriev more images from flickr (onScroll Pagination)
        window.onscroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
                this.getPhotos();
            }
        };
    }

    componentDidMount() {
        //Get latest images on load
        this.getPhotos()

        let suggestion = localStorage.getItem(suggestion);
    }

    handleChange(e) {
        //handle search field changes
        this.setState({
            searchData: e.target.value
        });
    }

    keyPress(e) {
        //trigger search through search input field
        if (e.keyCode === 13) {
            this.setState({
                isLoading: true,
                searchData: e.target.value,
                photos: [],
                next: 1
            }, function () {
                this.getPhotos()
            })
        }
    }

    onSubmit(e) {
        //prevent form submit from reloading
        e.preventDefault();
    }

    imageEnlarge(photo) {
        this.setState({
            modal: {
                image: photo.url,
                title: photo.title,
                display: 'flex'
            }
        })
    }

    imageHide() {
        this.setState({
            modal: {
                image: null,
                title: null,
                display: 'none'
            }
        })
    }

    getPhotos() {
        //Main function to retriev images through api

        const API_KEY = "3a132b2bb78af8acd1d62ca9b0d7389f" //API key const
        let METHOD = "flickr.photos.search" //Method declaration for recent or search photos

        if (validator.isEmpty(this.state.searchData))
            METHOD = "flickr.photos.getRecent"

        this.setState({
            isLoading: true,
            isEmpty: false
        })


        if (this.state.next !== null) {
            fetch(`https://api.flickr.com/services/rest/?page=${this.state.next}&method=${METHOD}&api_key=${API_KEY}&text=${this.state.searchData}&format=json&nojsoncallback=1`, {
                method: 'GET'
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    if (data.photos.photo.length > 0) {
                        let next = data.photos.page + 1
                        if (data.photos.page === data.photos.pages) {
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

                    else if (data.photos.total === '0') {
                        this.setState({
                            isEmpty: true
                        })
                    }

                    this.setState({
                        isLoading: false
                    })
                })
        }
    }

    render() {
        const {
            searchData,
            isLoading,
            photos,
            modal,
            isEmpty
        } = this.state;

        const defaultOptionsLottie = {
            loop: true,
            autoplay: true,
            animationData: require('./empty.json'),
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
            },
        }

        return (
            <>
                <nav>
                    <img src="img/logo.png" /><br />
                    <form autoComplete="on" onSubmit={this.onSubmit.bind(this)}>
                        <input type="search" value={searchData} onKeyDown={this.keyPress.bind(this)} onChange={this.handleChange.bind(this)} placeholder="Search" />
                        <suggestion>
                            <span>Hello</span>
                            <span>Hello</span>
                        </suggestion>
                    </form>
                </nav>

                <container>
                    {photos.map(photo => (
                        <column key={photo.id}>
                            <wrap onClick={() => this.imageEnlarge(photo)} className="shimmer" style={{ backgroundImage: `url(${photo.url})`, backgroundSize: `cover` }}></wrap>
                        </column>
                    ))}

                    {
                        (isLoading) ? (<><column><wrap className="shimmer"></wrap></column> <column><wrap className="shimmer"></wrap></column> <column><wrap className="shimmer"></wrap></column> <column><wrap className="shimmer"></wrap></column> <column><wrap className="shimmer"></wrap></column> <column><wrap className="shimmer"></wrap></column></>) : (<></>)
                    }

                    {
                        (isEmpty) ? (<div className="empty"><Lottie options={defaultOptionsLottie} height={350} width={350} /></div>) : (<></>)
                    }
                </container>

                <modal className="animated fadeIn" onClick={() => this.imageHide()} style={{ display: `${modal.display}` }}>
                    <img src={`${modal.image}`} />
                </modal>
            </>
        )
    }
}

export default App;