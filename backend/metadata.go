package main

type Localized[T any] map[string]T

type ExternalSite struct {
	Name     string `yaml:"name"`
	URL      string `yaml:"url"`
	Purpose  string `yaml:"purpose,omitempty"`
	Username string `yaml:"username,omitempty"`
}

type Collection struct {
	ID          string            `yaml:"-"`
	Title       Localized[string] `yaml:"title"`
	Includes    string            `yaml:"includes"`
	Description Localized[string] `yaml:"description"`
	Singular    string            `yaml:"singular"`
	Plural      string            `yaml:"plural"`
}
