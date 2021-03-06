import React, { Component, Fragment, useContext, useEffect, useState } from "react";
import "../css/authenticatehomepage.css";
import { Tab, Tabs, Alert } from "react-bootstrap";
import Cookies from "universal-cookie";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import { useHistory } from "react-router";
import Navigation from "../components/Navigation";
import { DOMAIN, BACKEND_ADDRESS, CLIENT_ID } from "../consts";
import { FeedbackContext } from "../contexts/feedback-context";
import api from "../api";

/*
 * A view handling all authentication
 */
const AuthenticateHomePage = (props) => {
  const [accessToken, setAccessToken] = useState("");
  const [projectID, setProjectID] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [projectIDError, setProjectIDError] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);

  const [state, dispatch] = useContext(FeedbackContext);

  /*
   * OnChange handlers to store input field contents in state
   */
  const handleChangeToken = (event) => {
    setAccessToken(event.target.value);
  }

  const handleChangeProjectID = (event) => {
    setProjectID(event.target.value);
  }

  /*
   * Authentication with Access Token and Project ID
   */
  const getFigmaProject = () => {
    if (!validateForm()) {
      setLoaderVisible(true);
      setErrorMessageVisible(false);
      api
        .get(`/projects/${projectID}/wireframes`, {params: {
          accessToken,
          authType: "originalToken",
        }})
        .then(res => {
          setLoaderVisible(false);
          setErrorMessageVisible(false);
          const cookies = new Cookies();
          cookies.set("accessToken", accessToken, { path: "/" });
          cookies.set("projectID", projectID, { path: "/" });
          cookies.set("authType", "originalToken", { path: "/" });
          props.history.push({
            pathname: "/wireframes",
            state: {
              projectName: res.data.projectName,
              wireframeList: res.data.wireframes,
              userID: state.userID,
            },
          });
        })
        .catch((e) => {
          console.log(e);
          setLoaderVisible(false);
          setErrorMessageVisible(true);
          setTokenError(true);
          setProjectIDError(true);
        });
    }
  }

  /*
   * Basic form validation
   */
  const validateForm = () => {
    let error = false;
    if (!(accessToken.length > 0)) {
      setTokenError(true);
      error = true;
    } else {
      setTokenError(false);
    }
    if (!(projectID.length > 0)) {
      setProjectIDError(true);
      error = true;
    } else {
      setProjectIDError(false);
    }
    return error;
  }

  /*
   * Authentication with OAuth
   * (Redirect to Figma's OAuth API)
   */
  const oauthRedirect = () => {
    window.location.href = `https://www.figma.com/oauth?client_id=${CLIENT_ID}&redirect_uri=${DOMAIN}/auth&scope=file_read&state=get_token&response_type=code`;
  }

  return (
    <>
      {/* pass the router as props to sub component */}
      <Navigation history={useHistory()} />
      {/* Alert */}
      {/* {state.projectExists === false && (
        <Alert variant="danger">
          The project with ID{" "}
          <Alert.Link href="/notfound">{props.projectID}</Alert.Link> is not in our
          database. Please make sure you have converted it first.
        </Alert>
      )} */}
      <div className="container">
        <div className="row">
          <div className="col-12 col-lg-8 offset-lg-2 text-center">
            <h3 className="mt-5">
              Welcome to ImagineThis
            </h3>
            <p className="lead mt-3">
              ImagineThis allows you to <strong>build</strong> and
              <strong> run</strong> mobile applications from Figma
              prototypes. Get started by authenticating with Figma below.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-8 offset-lg-2">
            <div className="auth-form">
              <Tabs
                defaultActiveKey="auth-token"
                id="uncontrolled-tab-example"
              >
                <Tab eventKey="auth-token" title="Authenticate with Token">
                  <h5>Please enter your Figma access token and project ID</h5>
                  <p className="mt-2">
                    <a
                      href="https://www.figma.com/developers/api#access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Click here
                    </a>
                    {" "}
                    to learn how to generate your Figma access token and
                    project ID
                  </p>
                  <input
                    className={`form-control mt-4 ${
                      tokenError ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your Figma access token"
                    onChange={handleChangeToken}
                    required
                  />
                  <input
                    className={`form-control mt-3 ${
                      projectIDError ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your Figma project ID"
                    onChange={handleChangeProjectID}
                    required
                  />
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => getFigmaProject()}
                  >
                    Submit
                  </button>
                  {errorMessageVisible && (
                    <p className="mt-3 error_message">
                      *The token or the project ID is not correct, please try
                      again
                    </p>
                  )}
                  {loaderVisible && (
                    <div className="d-flex justify-content-center">
                      <Loader
                        type="Oval"
                        color="#005EB8"
                        width={50}
                        height={50}
                      />
                    </div>
                  )}
                </Tab>
                <Tab eventKey="Oauth2" title="Oauth 2.0 Authentication">
                  <h5>
                    Please log into Figma to get project access authorisation
                  </h5>
                  <p className="mt-2">
                    You will be redirected to Figma's authentication page
                    where you will be able to log in and get access to you
                    project, using the Oauth 2.0 protocol.
                    <a
                      href="https://oauth.net/2/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Click here
                    </a>
                    {" "}
                    to get more detailed information about this authentication
                    method.
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => oauthRedirect()}
                  >
                    Authenticate with Oauth 2.0
                  </button>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthenticateHomePage;
